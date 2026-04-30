import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

import type { JSX } from 'react';

export default function ProtectedRoute(): JSX.Element {
  const { user, isLoading } = useAuthStore();

  if (isLoading)
    return (
      <div className="h-screen w-screen bg-night flex items-center justify-center">
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-platinum/60"
        >
          <circle cx="4" cy="12" r="3">
            <animate
              id="spinner_qFRN"
              begin="0;spinner_OcgL.end+0.25s"
              attributeName="cy"
              calcMode="spline"
              dur="0.6s"
              values="12;6;12"
              keySplines=".33,.66,.66,1;.33,0,.66,.33"
            />
          </circle>
          <circle cx="12" cy="12" r="3">
            <animate
              begin="spinner_qFRN.begin+0.1s"
              attributeName="cy"
              calcMode="spline"
              dur="0.6s"
              values="12;6;12"
              keySplines=".33,.66,.66,1;.33,0,.66,.33"
            />
          </circle>
          <circle cx="20" cy="12" r="3">
            <animate
              id="spinner_OcgL"
              begin="spinner_qFRN.begin+0.2s"
              attributeName="cy"
              calcMode="spline"
              dur="0.6s"
              values="12;6;12"
              keySplines=".33,.66,.66,1;.33,0,.66,.33"
            />
          </circle>
        </svg>
      </div>
    );

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
