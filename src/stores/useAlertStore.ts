import { create } from 'zustand';

type AlertOptions = {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => Promise<void> | void;
};

type AlertState = AlertOptions & {
  isOpen: boolean;
  isLoading: boolean;
  showAlert: (options: AlertOptions) => void;
  closeAlert: () => void;
  setLoading: (loading: boolean) => void;
};

const defaultState = {
  isOpen: false,
  isLoading: false,
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isDanger: true,
  onConfirm: () => {},
};

export const useAlertStore = create<AlertState>((set) => ({
  ...defaultState,
  showAlert: (options) => set({ ...options, isOpen: true, isLoading: false }),
  closeAlert: () => set({ isOpen: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
