import { useState } from 'react';
import { useAuthStore } from '../../../../stores/useAuthStore';

import api from '../../../../lib/axios';

import SectionLayout from '../../../../components/layouts/SectionLayout';

import SubmitButton from '../../../../components/elements/SubmitButton';
import ArrowLeftIcon from '../../../../components/icons/ArrowLeftIcon';

import type { SubmitEvent, ChangeEvent, JSX } from 'react';

type Props = { onBack: () => void };

export default function ChangeUsername({ onBack }: Props): JSX.Element {
  const { user, checkSession } = useAuthStore();

  const [username, setUsername] = useState<string>(user?.username || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) return;

    setIsLoading(true);

    try {
      await api.patch('users/username', { username });

      checkSession();
    } catch {
      /** empty */
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-6 border-b border-ebony-light">
        <button type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-xl text-platinum/85">Change Username</h1>
      </nav>
      <div className="px-4 w-full flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="ml-2 font-semibold text-[1.15rem] text-platinum/85 tracking-wide"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={handleChange}
              className="h-12 outline-none rounded-xl font-semibold tracking-wide px-3 text-platinum/75 bg-dark-deep border-[0.05rem] border-ebony-light"
            />
            <span className="mt-1 px-2 text-sm text-platinum/65">
              3–25 chars, lowercase, letters, numbers, dots and underscores only
            </span>
          </div>
          <SubmitButton label="Save Change" mt={0} is_loading={isLoading} />
        </form>
      </div>
    </SectionLayout>
  );
}
