import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  is_page: 'login' | 'register' | 'verify' | 'forgot_password' | 'reset_password';
};

const titleOnPage = {
  login: 'Reconnect with Them',
  register: 'Be Part of Us',
  verify: 'Verify Your Identity',
  forgot_password: 'Recover Your Access',
  reset_password: 'Create New Password',
};

const descriptionOnPage = {
  login:
    'Distance is no barrier as long as the message is delivered. Log in to reach those far away.',
  register: 'Create your account in a flash and start fun conversations with new people today.',
  verify: "We've sent you a verification code. Enter it below to activate and secure your account.",
  forgot_password: 'No worries! Enter your email to regain access to your chats.',
  reset_password: 'Set a strong, unique password to keep your account safe.',
};

const minHeight = {
  login: 'min-h-150',
  register: 'min-h-170',
  verify: 'min-h-150',
  forgot_password: 'min-h-150',
  reset_password: 'min-h-150',
};

export default function AuthLayout({ children, is_page }: Props): JSX.Element {
  return (
    <main
      className={`hidden xxs:flex h-screen ${minHeight[is_page]} justify-center items-center overflow-y-auto text-primary bg-night`}
    >
      <div className="w-full xs:max-w-90 s:max-w-97.5 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-center gap-1 font-dm-sans">
            <h1 className="mb-2 text-4xl font-black text-platinum/85">iYou</h1>
            <h2 className="text-2xl font-semibold text-platinum/80">{titleOnPage[is_page]}</h2>
            <p className="text-platinum/80 text-sm">{descriptionOnPage[is_page]}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
