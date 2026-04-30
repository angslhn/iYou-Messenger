import { create } from 'zustand';

import ws from '../lib/ws';
import api from '../lib/axios';

interface SocialState {
  pendingInvites: number;
  pendingRequests: number;
  setPendingInvites: (count: number) => void;
  setPendingRequests: (count: number) => void;
  decrementInvites: () => void;
  decrementRequests: () => void;
  fetchInitialCounts: () => Promise<void>;
  initSocialListeners: () => void;
  clearSocialListeners: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  pendingInvites: 0,
  pendingRequests: 0,

  setPendingInvites: (count) => set({ pendingInvites: count }),
  setPendingRequests: (count) => set({ pendingRequests: count }),

  // Dipanggil saat user accept/reject dari UI
  decrementInvites: () =>
    set((state) => ({
      pendingInvites: Math.max(0, state.pendingInvites - 1),
    })),

  decrementRequests: () =>
    set((state) => ({
      pendingRequests: Math.max(0, state.pendingRequests - 1),
    })),

  // Dipanggil sekali saja saat aplikasi pertama kali dimuat
  fetchInitialCounts: async () => {
    try {
      const { data } = await api.get('/users/me/counters');

      set({
        pendingRequests: data.pendingRequests,
        pendingInvites: data.pendingInvites,
      });
    } catch {
      /** empty */
    }
  },

  initSocialListeners: () => {
    // Bersihkan dulu dari memori jaga-jaga kalau ada sisa HMR Vite
    get().clearSocialListeners();

    // Tiap ada undangan masuk, tambah angkanya +1
    ws.on('group:invite_received', () => {
      set((state) => ({ pendingInvites: state.pendingInvites + 1 }));
    });

    // Tiap ada request pertemanan masuk, tambah angkanya +1
    ws.on('friend:request_received', () => {
      set((state) => ({ pendingRequests: state.pendingRequests + 1 }));
    });
  },

  clearSocialListeners: () => {
    ws.off('group:invite_received');
    ws.off('friend:request_received');
  },
}));
