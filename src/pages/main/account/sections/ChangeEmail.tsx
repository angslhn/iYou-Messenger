import axios from 'axios';
import api from '../../../../lib/axios';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../stores/useAuthStore';

import ArrowLeftIcon from '../../../../components/icons/ArrowLeftIcon';
import SectionLayout from '../../../../components/layouts/SectionLayout';
import CodeInput from '../../../../components/elements/CodeInput';
import SubmitButton from '../../../../components/elements/SubmitButton';
import ErrorValue from '../../../../components/elements/ErrorValue';

import * as Validation from '../../../../validators/input.validator';

import type { ChangeEvent, JSX } from 'react';

type Step = 'form' | 'verify';
type Props = { onBack: () => void };

export default function ChangeEmail({ onBack }: Props): JSX.Element {
  const [step, setStep] = useState<Step>('form');

  const { user, checkSession } = useAuthStore();

  const [newEmail, setNewEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [resendDelay, setResendDelay] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (resendDelay <= 0) return;

    const timer = setInterval(() => {
      setResendDelay((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendDelay]);

  const handleSubmitForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const checkCurrent = !user?.email ? 'Current email cannot be empty' : null;

    const checkNew = Validation.email(newEmail);

    if (checkCurrent || checkNew) {
      setEmailError(checkCurrent ?? checkNew ?? '');
      return;
    }

    if (newEmail === user?.email) {
      setEmailError('New email cannot be the same as current email');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      const {
        data: { token },
      } = await api.patch('/users/email', {
        email: newEmail,
      });

      setToken(token);
      setResendDelay(60);
      setStep('verify');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        if (msg) setEmailError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 6 || !/^[0-9a-f]{64}$/.test(token)) return;

    setLoading(true);

    try {
      await api.post('/users/email/verify', {
        token,
        otp,
      });

      await checkSession();
      onBack();
    } catch {
      /** empty */
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDelay > 0) return;

    setResendDelay(60);

    try {
      await api.post('/users/resend', {
        email: newEmail,
        type: 'email_otp',
      });
    } catch {
      /** empty */
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmailError('');
    setNewEmail(e.target.value);
  };

  const maskedEmail = newEmail
    ? newEmail.split('@')[0]?.charAt(0) +
      '*'.repeat((newEmail.split('@')[0]?.length ?? 1) - 1) +
      '@' +
      newEmail.split('@')[1]
    : '';

  if (step === 'verify') {
    return (
      <SectionLayout>
        <nav className="h-14 flex items-center gap-4 px-6 border-b border-ebony-light">
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setOtp('');
              setEmailError('');
            }}
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="font-semibold text-xl text-platinum/85">Verify New Email</h1>
        </nav>
        <div className="px-6 w-full flex flex-col items-center">
          <form onSubmit={handleVerify} className="w-full flex flex-col items-center gap-6 py-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="size-16 flex justify-center items-center rounded-2xl bg-dark-deep border border-ebony-light">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-7 fill-platinum/70"
                >
                  <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM12.0606 11.6829L5.64722 6.2377L4.35278 7.7623L12.0731 14.3171L19.6544 7.75616L18.3456 6.24384L12.0606 11.6829Z" />
                </svg>
              </div>
              <h2 className="font-bold text-lg text-platinum/85">Check your email</h2>
              <p className="text-sm text-platinum/50 leading-relaxed max-w-xs">
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-platinum/75">{maskedEmail}</span>. Enter it
                below to confirm your new email.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <CodeInput type="otp" length={6} onComplete={(code) => setOtp(code)} />
              {emailError && <ErrorValue text={emailError} />}
            </div>
            <SubmitButton label="Confirm Email Change" mt={0} is_loading={loading} />
            <div className="flex justify-center gap-1 text-sm text-platinum/60">
              <span>Didn't receive the code?</span>
              {resendDelay <= 0 ? (
                <span
                  role="button"
                  onClick={handleResend}
                  className="font-semibold text-platinum/85 hover:underline hover:cursor-pointer"
                >
                  Resend
                </span>
              ) : (
                <span className="font-semibold text-platinum/40">{resendDelay}s</span>
              )}
            </div>
          </form>
        </div>
      </SectionLayout>
    );
  }

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-6 border-b border-ebony-light">
        <button type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-xl text-platinum/85">Change Email</h1>
      </nav>

      <div className="px-4 w-full flex flex-col items-center">
        <form onSubmit={handleSubmitForm} className="w-full flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="current-email"
              className="ml-2 font-semibold text-[1.15rem] text-platinum/85 tracking-wide"
            >
              Current Email
            </label>
            <input
              type="email"
              id="current-email"
              value={user?.email ?? ''}
              readOnly
              className="h-12 outline-none rounded-xl font-semibold tracking-wide px-3 
             text-platinum/40 bg-dark-deep border-[0.05rem] border-ebony-light 
             cursor-not-allowed select-none"
            />
          </div>
          <div className="relative flex flex-col gap-1">
            <label
              htmlFor="new-email"
              className="ml-2 font-semibold text-[1.15rem] text-platinum/85 tracking-wide"
            >
              New Email
            </label>
            <input
              type="email"
              id="new-email"
              name="new-email"
              autoComplete="off"
              value={newEmail}
              onChange={handleChange}
              className="h-12 mb-1 outline-none rounded-xl font-semibold tracking-wide px-3 text-platinum/75 bg-dark-deep border-[0.05rem] border-ebony-light"
            />
            <ErrorValue text={emailError} />
            {emailError === '' && (
              <span className="absolute -bottom-1 px-2 text-sm text-platinum/50">
                A verification code will be sent to your new email
              </span>
            )}
          </div>
          <SubmitButton label="Send Verification Code" mt={0} is_loading={loading} />
        </form>
      </div>
    </SectionLayout>
  );
}
