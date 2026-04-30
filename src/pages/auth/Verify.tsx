import axios from 'axios';
import api from '../../lib/axios';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRedirect } from '../../hooks/useRedirect';

import AuthLayout from '../../components/layouts/AuthLayout';
import VerifyForm from '../../components/forms/VerifyForm';

import type { JSX } from 'react';

export default function Verify(): JSX.Element {
  const [delay, setDelay] = useState<number>(0);

  const location = useLocation();
  const navigate = useRedirect();

  const email = location.state?.email ?? '';

  useEffect(() => {
    if (delay <= 0) return;

    const timer = setInterval(() => {
      setDelay((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [delay]);

  const handleResend = async () => {
    setDelay(60);

    try {
      const {
        data: { redirect },
      } = await api.post('/auth/resend', { email });

      if (redirect) navigate(redirect);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const redirect = err.response?.data?.redirect;

        if (redirect) navigate(redirect);
      }
    }
  };

  return (
    <AuthLayout is_page="verify">
      <VerifyForm />
      <div className="mt-2 flex justify-center gap-1 text-center text-platinum">
        <span className="text-sm">You didn't receive the code?</span>
        {delay <= 0 ? (
          <span
            role="button"
            onClick={handleResend}
            className="text-sm font-semibold hover:underline hover:cursor-pointer"
          >
            Resend
          </span>
        ) : (
          <span className="text-sm font-semibold disabled text-platinum/80">{delay}</span>
        )}
      </div>
    </AuthLayout>
  );
}
