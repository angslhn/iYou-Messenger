import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

import type { JSX } from 'react';

export default function PublicWithTokenRoute(): JSX.Element {
  const { user } = useAuthStore();

  const { token } = useParams<{ token: string }>();

  const isValidToken = token && /^[a-f0-9]{64}$/.test(token);

  return isValidToken && !user ? <Outlet /> : <Navigate to="/login" replace />;
}
