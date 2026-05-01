import { useNavigate } from 'react-router-dom';

export type Redirect = 'home' | 'chat' | 'login' | 'register' | 'verify' | 'forgot_password';

export const REDIRECT_MAP: Record<Redirect, string> = {
  login: '/login',
  register: '/register',
  verify: '/verify',
  forgot_password: '/forgot-password',
  home: '/',
  chat: '/chat',
};

export function useRedirect() {
  const navigate = useNavigate();

  return (to: Redirect, state?: Record<string, unknown>, delay = 0) =>
    new Promise<void>((resolve) => {
      const executeNavigation = () => {
        navigate(REDIRECT_MAP[to], state ? { state } : undefined);
        resolve();
      };

      if (delay > 0) {
        setTimeout(executeNavigation, delay);
      } else {
        executeNavigation();
      }
    });
}
