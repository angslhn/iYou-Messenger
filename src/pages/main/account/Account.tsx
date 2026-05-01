import { useState } from 'react';

import { useAuthStore } from '../../../stores/useAuthStore';
import { useAlertStore } from '../../../stores/useAlertStore';

import api from '../../../lib/axios';

import RootLayout from '../../../components/layouts/RootLayout';
import MainLayout from '../../../components/layouts/MainLayout';

import PinMenu from '../../../components/ui/PinMenu';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import ArrowRightIcon from '../../../components/icons/ArrowRightIcon';
import SwitchButton from '../../../components/elements/SwitchButton';

import EditProfile from './sections/EditProfile';
import ChangeUsername from './sections/ChangeUsername';
import ChangeEmail from './sections/ChangeEmail';
import AddPhone from './sections/AddPhone';
import ChangePhone from './sections/ChangePhoneNumber';
import ChangePassword from './sections/UpdatePassword';
import DeleteAccount from './sections/DeleteAccount';

import initialName from '../../../helpers/initial-name';
import blankAvatar from '../../../assets/images/blank.webp';
import { maskEmail, maskPhone } from '../../../helpers/mask-identity';

import type { ChangeEvent, JSX } from 'react';

type AccountSection =
  | 'profile'
  | 'username'
  | 'email'
  | 'add_phone'
  | 'change_phone'
  | 'password'
  | 'delete_account';

type PrivacySwitch = 'read_receipt' | 'story_receipt' | 'hide_profile' | 'show_last_seen';

export default function Account(): JSX.Element {
  const [accountSection, setAccountSection] = useState<AccountSection | null>(null);

  const { user, logout, isLoading } = useAuthStore(); // isLoading sudah ada di store
  const { showAlert } = useAlertStore();

  const [privacyToggles, setPrivacyToggles] = useState<Record<PrivacySwitch, boolean>>({
    read_receipt: user?.read_receipt ?? true,
    story_receipt: user?.story_receipt ?? true,
    hide_profile: user?.hide_profile ?? false,
    show_last_seen: user?.show_last_seen ?? true,
  });

  const charColors = [
    'bg-[#1f1f1f] border-[#2a2a2a]',
    'bg-[#1c1c1c] border-[#272727]',
    'bg-[#222222] border-[#2d2d2d]',
    'bg-[#1e1e1e] border-[#292929]',
    'bg-[#212121] border-[#2c2c2c]',
    'bg-[#1d1d1d] border-[#282828]',
    'bg-[#202020] border-[#2b2b2b]',
    'bg-[#1f1f1f] border-[#2a2a2a]',
  ];

  const [pin, setPin] = useState<string | null>(user?.pin ?? null);
  const [pinMenuOpen, setPinMenuOpen] = useState<boolean>(false);

  const handleBack = () => setAccountSection(null);

  const sections: Record<AccountSection, JSX.Element> = {
    profile: <EditProfile onBack={handleBack} />,
    username: <ChangeUsername onBack={handleBack} />,
    email: <ChangeEmail onBack={handleBack} />,
    add_phone: <AddPhone onBack={handleBack} />,
    change_phone: <ChangePhone onBack={handleBack} />,
    password: <ChangePassword onBack={handleBack} />,
    delete_account: <DeleteAccount onBack={handleBack} />,
  };

  const handlePrivacyToggle =
    (field: PrivacySwitch) => async (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;

      setPrivacyToggles((prev) => ({ ...prev, [field]: value }));

      try {
        await api.patch('/users/' + field.replaceAll('_', '-'), { value });
      } catch {
        setPrivacyToggles((prev) => ({ ...prev, [field]: !value }));
      }
    };

  const handleGeneratePin = async () => {
    try {
      const {
        data: { pin },
      } = await api.patch('/users/pin');

      setPin(pin);
    } catch {
      /** empty */
    }
  };

  const handleDeletePin = async () => {
    try {
      await api.delete('/users/pin');
      setPin(null);
    } catch {
      /** empty */
    }
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Delete Account',
      description:
        'This action is permanent. All your data will be deleted and cannot be recovered.',
      confirmText: 'Delete Account',
      isDanger: true,
      onConfirm: () => setAccountSection('delete_account'),
    });
  };

  const handleLogoutClick = () => {
    showAlert({
      title: 'Log Out',
      description: 'Are you sure you want to log out from this device?',
      confirmText: 'Log Out',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          /** empty */
        } finally {
          logout();
        }
      },
    });
  };

  if (accountSection) return sections[accountSection];

  return (
    <RootLayout>
      <MainLayout>
        <div className="pb-4">
          {isLoading ? (
            <SkeletonItem type="account" />
          ) : (
            <>
              <div className="flex flex-col flex-1 min-w-0 items-center gap-1.5 py-6 border-b border-ebony-light">
                <div className="relative size-25 flex justify-center items-center rounded-full shrink-0 bg-dark-deep border-2 border-ebony-light shadow-inner overflow-hidden">
                  {user?.fullname && !user.avatar_url ? (
                    <span
                      className="font-bold text-4xl text-platinum/85 select-none"
                      aria-hidden="true"
                    >
                      {initialName(user.fullname ?? user.username)}
                    </span>
                  ) : (
                    <img
                      src={user?.avatar_url ?? blankAvatar}
                      alt={`Avatar ${user?.fullname || user?.username}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  {user?.fullname && (
                    <h2 className="font-bold text-xl text-platinum/85 select-none">
                      {user.fullname}
                    </h2>
                  )}
                  <span className="font-semibold text-[0.95rem] text-platinum/75 select-none">
                    @{user?.username}
                  </span>
                </div>
                {user?.about && (
                  <div className="flex items-start gap-2 max-w-62.5 px-3 py-2 rounded-xl bg-dark-deep border border-ebony-light">
                    <p className="text-[0.85rem] text-platinum/60 leading-relaxed line-clamp-2">
                      {user.about}
                    </p>
                  </div>
                )}
                <div className="mt-2 flex flex-col justify-center items-center gap-2">
                  <div className="flex items-center gap-1">
                    {(pin ?? '--------').split('').map((char, i) => (
                      <div
                        key={i}
                        className={`size-7 flex items-center justify-center rounded-md border ${charColors[i]}`}
                      >
                        <span
                          className={`font-bold tracking-normal select-none ${
                            pin ? 'text-platinum/75' : 'text-platinum/20'
                          }`}
                        >
                          {pin ? char : '–'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <section aria-labelledby="account" className="flex flex-col">
                  <h2
                    id="account"
                    className="font-semibold text-xs text-platinum/70 tracking-wider my-2"
                  >
                    ACCOUNT
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAccountSection('profile')}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Profil</h3>
                      <span className="text-platinum/50 text-sm">Avatar, Fullname, and About</span>
                    </div>
                    <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountSection('username')}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 fill-platinum/70"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14H12V16H8C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8V12H8C5.79086 12 4 10.2091 4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8V10H14V8C14 4.68629 11.3137 2 8 2ZM10 10V8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10H10Z"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Username</h3>
                      <span className="text-platinum/50 text-sm">{user?.username}</span>
                    </div>
                    <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountSection('email')}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM12.0606 11.6829L5.64722 6.2377L4.35278 7.7623L12.0731 14.3171L19.6544 7.75616L18.3456 6.24384L12.0606 11.6829Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Email</h3>
                      <span className="text-platinum/50 text-sm">
                        {maskEmail(user?.email ?? '')}
                      </span>
                    </div>
                    <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountSection(!user?.phone ? 'add_phone' : 'change_phone')}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Phone</h3>
                      <span className="text-platinum/50 text-sm">
                        {user?.phone ? maskPhone(user.phone) : 'Add your phone number'}
                      </span>
                    </div>
                    <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountSection('password')}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 fill-platinum/70"
                      >
                        <path d="M18 8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8ZM16 8V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V8H16ZM11 14V16H13V14H11ZM7 14V16H9V14H7ZM15 14V16H17V14H15Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Password</h3>
                      <span className="text-platinum/50 text-sm">Change Password</span>
                    </div>
                    <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon />
                    </div>
                  </button>
                </section>
                <section aria-labelledby="privacy" className="flex flex-col">
                  <h2
                    id="privacy"
                    className="font-semibold text-xs text-platinum/70 tracking-wider my-2"
                  >
                    PRIVACY
                  </h2>
                  {pin ? (
                    <div className="relative flex justify-baseline items-center gap-4 mt-4 border-b border-ebony-light pb-2">
                      <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 256 256"
                          className="size-5 fill-platinum/70"
                        >
                          <path d="M112,112h32v32H112ZM224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Zm-64,96V112h32a8,8,0,0,0,0-16H160V64a8,8,0,0,0-16,0V96H112V64a8,8,0,0,0-16,0V96H64a8,8,0,0,0,0,16H96v32H64a8,8,0,0,0,0,16H96v32a8,8,0,0,0,16,0V160h32v32a8,8,0,0,0,16,0V160h32a8,8,0,0,0,0-16Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-bold text-platinum/85 leading-tight">PIN</h3>
                        <span className="text-platinum/50 text-sm tracking-widest font-semibold">
                          {pin}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPinMenuOpen(true)}
                        className="p-2 rounded-full bg-dark-deep border border-ebony-light hover:cursor-pointer active:scale-95 transition-transform"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 256 256"
                          className="size-3 fill-platinum/70"
                        >
                          <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM128,76a28,28,0,1,0-28-28A28,28,0,0,0,128,76Zm0,104a28,28,0,1,0,28,28A28,28,0,0,0,128,180Z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGeneratePin}
                      className="group relative flex items-center gap-4 mt-4 border-b border-ebony-light pb-2 w-full text-left active:opacity-70 transition-all"
                    >
                      <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="size-5 fill-platinum/70"
                        >
                          <path d="M576 56L497 135C396.7 39 237.6 40.3 139 139C89 189 64 254.5 64 320L128 320C128 270.8 146.7 221.7 184.2 184.2C257.8 110.6 376.4 109.2 451.7 180.3L376 256L576 256L576 56zM188.3 459.7L264 384L64 384L64 584L143 505C243.3 601 402.4 599.7 501 501C551 451 576 385.4 576 320L512 320C512 369.2 493.3 418.3 455.8 455.8C382.2 529.4 263.6 530.8 188.3 459.7z" />
                        </svg>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-bold text-platinum/85 leading-tight">PIN</h3>
                        <span className="text-platinum/50 text-sm">Tap to generate PIN</span>
                      </div>
                      <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                        <ArrowRightIcon />
                      </div>
                    </button>
                  )}
                  <PinMenu
                    isOpen={pinMenuOpen}
                    onClose={() => setPinMenuOpen(false)}
                    pin={pin ?? ''}
                    onCopy={() => {
                      navigator.clipboard.writeText(pin ?? '');
                    }}
                    onRegenerate={async () => {
                      try {
                        await handleGeneratePin();
                      } finally {
                        setPinMenuOpen(false);
                      }
                    }}
                    onDelete={async () => {
                      try {
                        await handleDeletePin();
                      } finally {
                        setPinMenuOpen(false);
                      }
                    }}
                  />
                  <div className="relative flex justify-baseline items-center gap-4 mt-4 border-b border-ebony-light pb-2">
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L343.5 309.7C398.5 298.8 440 250.2 440 192C440 125.7 386.3 72 320 72C261.8 72 213.2 113.5 202.3 168.5L73 39.1zM267.6 369.4C179.9 380.6 112 455.5 112 546.3C112 562.7 125.3 576 141.7 576L474.2 576L267.6 369.4z" />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Hide Profile</h3>
                      <span className="text-platinum/50 text-sm">Hide from search</span>
                    </div>
                    <SwitchButton
                      is_checked={privacyToggles.hide_profile}
                      handleChange={handlePrivacyToggle('hide_profile')}
                    />
                  </div>
                  <div className="relative flex justify-baseline items-center gap-4 mt-2 border-b border-ebony-light pb-2">
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Read Receipt</h3>
                      <span className="text-platinum/50 text-sm">Show when read message</span>
                    </div>
                    <SwitchButton
                      is_checked={privacyToggles.read_receipt}
                      handleChange={handlePrivacyToggle('read_receipt')}
                    />
                  </div>
                  <div className="relative flex justify-baseline items-center gap-4 mt-4 border-b border-ebony-light pb-2">
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Story Receipt</h3>
                      <span className="text-platinum/50 text-sm">
                        Show when you've viewed a story
                      </span>
                    </div>
                    <SwitchButton
                      is_checked={privacyToggles.story_receipt}
                      handleChange={handlePrivacyToggle('story_receipt')}
                    />
                  </div>
                  <div className="relative flex justify-baseline items-center gap-4 mt-4 border-b border-ebony-light pb-2">
                    <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="size-5 fill-platinum/70"
                      >
                        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H17V14H11V7H13V12Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-platinum/85 leading-tight">Last Seen</h3>
                      <span className="text-platinum/50 text-sm">Show last active</span>
                    </div>
                    <SwitchButton
                      is_checked={privacyToggles.show_last_seen}
                      handleChange={handlePrivacyToggle('show_last_seen')}
                    />
                  </div>
                </section>
                <section aria-labelledby="danger-zone" className="flex flex-col">
                  <h2
                    id="danger-zone"
                    className="font-semibold text-xs text-platinum/70 tracking-wider my-2"
                  >
                    DANGER ZONE
                  </h2>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl group-hover:bg-red-600/20 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        className="size-4 fill-red-600/70"
                      >
                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-red-600/85 leading-tight">Delete Account</h3>
                      <p className="text-red-600/60 text-xs truncate mt-0.5">
                        This action is permanent
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="group relative flex items-center gap-4 py-3 border-b border-ebony-light text-left active:opacity-70 transition-all"
                  >
                    <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl group-hover:bg-red-600/20 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="size-5 fill-red-600/70"
                      >
                        <path d="M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160zM566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-red-600/85 leading-tight">Logout</h3>
                      <p className="text-red-600/60 text-xs truncate mt-0.5">
                        Exit the current session
                      </p>
                    </div>
                  </button>
                </section>
              </div>
            </>
          )}
        </div>
      </MainLayout>
    </RootLayout>
  );
}
