import { useNavigate } from 'react-router-dom';

export type Redirect = 'home' | 'login' | 'register' | 'verify' | 'forgot_password';

export const REDIRECT_MAP: Record<Redirect, string> = {
  login: '/login',
  register: '/register',
  verify: '/verify',
  forgot_password: '/forgot-password',
  home: '/',
};

export function useRedirect() {
  const navigate = useNavigate();

  return (to: Redirect, state?: object, delay = 0) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        navigate(REDIRECT_MAP[to], state ? { state } : undefined);
        resolve();
      }, delay),
    );
}
