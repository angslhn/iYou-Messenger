import axios from 'axios';
import api from '../../lib/axios';

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRedirect } from '../../hooks/useRedirect';

import CodeInput from '../elements/CodeInput';
import SubmitButton from '../elements/SubmitButton';

import type { SubmitEvent, JSX } from 'react';

export default function VerifyForm(): JSX.Element {
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useRedirect();

  const email = location.state?.email ?? '';

  useEffect(() => {
    if (!email) navigate('login');
  }, [navigate, email]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const {
        data: { redirect },
      } = await api.post('/auth/verify', { email, otp });

      if (redirect) navigate(redirect);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const redirect = err.response?.data?.redirect;

        if (redirect) navigate(redirect);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center font-semibold text-platinum/85"
    >
      <CodeInput type="otp" length={6} onComplete={(code) => setOtp(code)} />
      <SubmitButton label="Verify Account" mt={2} is_loading={loading} />
    </form>
  );
}
