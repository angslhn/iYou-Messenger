import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import api from '../lib/axios';
import ws from '../lib/ws';

import { useChatStore } from './useChatStore';
import { useSocialStore } from './useSocialStore';

import type { UserData } from '../@types/globals';

interface AuthState {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  checkSession: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: true,

      init: () => {
        ws.off('auth:force_logout');
        ws.on('auth:force_logout', () => {
          get().logout();
        });
      },

      login: (userData: UserData) => {
        set({ user: userData, isLoggedIn: true });
        ws.connect();
        get().init();

        useChatStore.getState().initChatListeners();
        useSocialStore.getState().initSocialListeners();
      },

      logout: () => {
        ws.off('auth:force_logout');
        ws.disconnect();
        set({ user: null, isLoggedIn: false });

        useChatStore.getState().clearChatListeners();
        useSocialStore.getState().clearSocialListeners();
      },

      updateUser: (data: Partial<UserData>) => {
        const currentUser = get().user;

        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      checkSession: async () => {
        set({ isLoading: true });

        try {
          const { data } = await api.get('/users/me');

          if (data) {
            set({ user: data, isLoggedIn: true, isLoading: false });
            ws.connect();
            get().init();

            useChatStore.getState().initChatListeners();
            useSocialStore.getState().initSocialListeners();
          }
        } catch {
          ws.off('auth:force_logout');
          ws.disconnect();
          set({ user: null, isLoggedIn: false, isLoading: false });

          useChatStore.getState().clearChatListeners();
          useSocialStore.getState().clearSocialListeners();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
