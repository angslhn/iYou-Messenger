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

export default function AddPhone({ onBack }: Props): JSX.Element {
  const [step, setStep] = useState<Step>('form');

  const { user, checkSession } = useAuthStore();

  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [resendDelay, setResendDelay] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    const checkPhone = Validation.phone(phone);

    if (checkPhone) {
      setPhoneError(checkPhone);
      return;
    }

    setPhoneError('');
    setIsLoading(true);

    try {
      const {
        data: { token },
      } = await api.patch('/users/phone', { phone });

      setToken(token);
      setResendDelay(60);
      setStep('verify');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        if (msg) setPhoneError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 6 || !/^[0-9a-f]{64}$/.test(token)) return;

    setIsLoading(true);

    try {
      await api.post('/users/phone/verify', { token, otp });

      await checkSession();
      onBack();
    } catch {
      /** empty */
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDelay > 0) return;

    setResendDelay(60);

    try {
      await api.post('/users/resend', { email: user?.email, type: 'phone_otp' });
    } catch {
      /** empty */
    }
  };

  const maskedEmail = user?.email
    ? user.email.split('@')[0]?.charAt(0) +
      '*'.repeat((user.email.split('@')[0]?.length ?? 1) - 1) +
      '@' +
      user.email.split('@')[1]
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
              setPhoneError('');
            }}
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="font-semibold text-xl text-platinum/85">Verify Phone Number</h1>
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
                  <path d="M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z" />
                </svg>
              </div>
              <h2 className="font-bold text-lg text-platinum/85">Check your email</h2>
              <p className="text-sm text-platinum/50 leading-relaxed max-w-xs">
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-platinum/75">{maskedEmail}</span>. Enter it
                below to confirm your phone number.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <CodeInput type="otp" length={6} onComplete={(code) => setOtp(code)} />
              {phoneError && <ErrorValue text={phoneError} />}
            </div>
            <SubmitButton label="Confirm Phone Number" mt={0} is_loading={isLoading} />
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
        <h1 className="font-semibold text-xl text-platinum/85">Add Phone Number</h1>
      </nav>

      <div className="px-4 w-full flex flex-col items-center">
        <form onSubmit={handleSubmitForm} className="w-full flex flex-col gap-6 py-6">
          <div className="relative flex flex-col gap-1">
            <label
              htmlFor="phone"
              className="ml-2 font-semibold text-[1.15rem] text-platinum/85 tracking-wide"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="off"
              placeholder="+6281234567890"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPhoneError('');
                setPhone(e.target.value);
              }}
              className="h-12 mb-4 outline-none rounded-xl font-semibold tracking-wide px-3 text-platinum/75 bg-dark-deep border-[0.05rem] border-ebony-light"
            />
            <ErrorValue text={phoneError} />
            {phoneError === '' && (
              <span className="absolute -bottom-2 px-2 text-sm text-platinum/50">
                Start with country code, e.g. +62 for Indonesia. A verification code will be sent to
                your email.
              </span>
            )}
          </div>
          <SubmitButton label="Send Verification Code" mt={0} is_loading={isLoading} />
        </form>
      </div>
    </SectionLayout>
  );
}
