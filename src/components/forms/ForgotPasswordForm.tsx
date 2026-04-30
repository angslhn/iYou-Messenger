import axios from 'axios';
import api from '../../lib/axios';

import { useState } from 'react';
import { useRedirect } from '../../hooks/useRedirect';

import * as Validation from '../../validators/auth.validator';

import SubmitButton from '../elements/SubmitButton';
import ErrorValue from '../elements/ErrorValue';

import type { JSX, SubmitEvent } from 'react';

export default function ForgotPasswordForm(): JSX.Element {
  const [identifier, setIdentifier] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useRedirect();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const checkForm = Validation.forgotPassword(identifier);

    if (checkForm) {
      return setError(checkForm);
    }

    setLoading(true);

    try {
      const {
        data: { redirect },
      } = await api.post('/auth/forgot-password', { identifier });

      if (redirect) navigate(redirect);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const email = err.response?.data?.email;
        const redirect = err.response?.data?.redirect;

        const state = redirect === 'verify' ? { email } : undefined;

        if (redirect) navigate(redirect, state);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col text-platinum/85">
      <div className="flex flex-col gap-1">
        <label htmlFor="identifier" className="ml-2 font-semibold">
          Account ID
        </label>
        <input
          type="text"
          id="identifier"
          name="identifier"
          placeholder="Email, or phone number"
          autoComplete="identifier"
          onChange={(e) => setIdentifier(e.target.value)}
          className="h-12 outline-none rounded-xl px-3 bg-raisin-black border-[0.05rem] border-spanish-gray placeholder:text-sm"
        />
        <ErrorValue text={error} />
      </div>
      <SubmitButton label="Send Recovery Link" mt={4} is_loading={loading} />
    </form>
  );
}
