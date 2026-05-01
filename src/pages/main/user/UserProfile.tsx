import { useEffect, useState } from 'react';

import api from '../../../lib/axios';
import initialName from '../../../helpers/initial-name';

import { useNavigate, useParams } from 'react-router-dom';
import { useAlertStore } from '../../../stores/useAlertStore';

import SectionLayout from '../../../components/layouts/SectionLayout';

import ArrowLeftIcon from '../../../components/icons/ArrowLeftIcon';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import formatLastSeen from '../../../helpers/format-last-seen';

import type { JSX } from 'react';

type Props = {
  showActions?: boolean;
};

type UserProfileData = {
  id: string;
  username: string;
  fullname: string | null;
  about: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_online: boolean;
  last_seen: string | null;
};

export default function UserProfile({ showActions = true }: Props): JSX.Element {
  const navigate = useNavigate();

  const { userId } = useParams<{ userId: string }>();
  const { showAlert } = useAlertStore();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data);
      } catch {
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, navigate]);

  const handleBack = () => navigate(-1);

  const handleUnfriend = () => {
    showAlert({
      title: 'Unfriend User',
      description:
        "Are you sure you want to remove this user from your friends list? You'll need to send a new request or use their PIN to connect again.",
      confirmText: 'Unfriend',
      isDanger: true,
      onConfirm: async () => {
        if (!profile?.id) return;

        try {
          await api.delete(`/friendships/${profile.id}`);

          navigate('/chat');
        } catch {
          /** empty */
        }
      },
    });
  };

  const handleBlock = () => {
    showAlert({
      title: 'Block This Friend',
      description:
        "You and this user will no longer be able to view each other's profiles, send messages, or interact with each other.",
      confirmText: 'Block',
      isDanger: true,
      onConfirm: async () => {
        if (!profile?.id) return;

        try {
          await api.patch(`/friendships/block/${profile.id}`);

          navigate('/friend');
        } catch {
          /** empty */
        }
      },
    });
  };

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-5 border-b border-ebony-light shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="hover:cursor-pointer active:scale-95 transition-transform"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-xl text-platinum/85 select-none">Profile</h1>
      </nav>

      <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
        {isLoading ? (
          <SkeletonItem type="profil" showActions={showActions} />
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 py-8 px-5 border-b border-ebony-light">
              <div className="size-24 flex justify-center items-center rounded-full bg-dark-deep border-2 border-ebony-light shrink-0">
                {profile?.avatar_url && profile.fullname ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.fullname}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="font-bold text-4xl select-none text-platinum/85">
                    {initialName(profile?.fullname || profile?.username || '')}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <h2 className="font-bold text-xl text-platinum/85 select-none">
                  {profile?.fullname ?? profile?.username}
                </h2>
                <span className="font-semibold text-sm text-platinum/50 select-none">
                  @{profile?.username}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`size-2 rounded-full ${profile?.is_online ? 'bg-green-400' : 'bg-platinum/30'}`}
                />
                <span className="text-xs font-semibold text-platinum/60 select-none">
                  {profile?.is_online
                    ? 'Online'
                    : profile?.last_seen
                      ? formatLastSeen(profile.last_seen)
                      : 'Offline'}
                </span>
              </div>
              {profile?.about && (
                <p className="mt-1 text-center text-sm text-platinum/60 italic leading-relaxed px-6 select-none">
                  "{profile?.about}"
                </p>
              )}
            </div>

            <div className="flex flex-col px-5 py-4 gap-1 border-b border-ebony-light">
              <h3 className="font-semibold text-xs text-platinum/50 tracking-wider select-none mb-2">
                INFO
              </h3>
              {profile?.phone && (
                <div className="flex items-center gap-4 py-3 border-b border-ebony-light">
                  <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-4 fill-platinum/70"
                    >
                      <path d="M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-platinum/40">Phone</span>
                    <span className="font-semibold text-platinum/85 text-sm">{profile?.phone}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 py-3">
                <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                  <svg
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 fill-platinum/70"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14H12V16H8C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8V12H8C5.79086 12 4 10.2091 4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8V10H14V8C14 4.68629 11.3137 2 8 2ZM10 10V8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10H10Z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-platinum/40">Username</span>
                  <span className="font-semibold text-platinum/85 text-sm">
                    @{profile?.username}
                  </span>
                </div>
              </div>
            </div>
            {showActions && (
              <div className="flex flex-col px-5 py-4 gap-1">
                <h3 className="font-semibold text-xs text-platinum/50 tracking-wider select-none mb-2">
                  ACTIONS
                </h3>
                <button
                  type="button"
                  onClick={handleUnfriend}
                  className="flex items-center gap-4 py-3 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer text-left"
                >
                  <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                      className="size-4 fill-platinum/70"
                    >
                      <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM472 200H616c13.3 0 24 10.7 24 24s-10.7 24-24 24H472c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                    </svg>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-platinum/85 leading-tight">Unfriend</span>
                    <span className="text-xs text-platinum/50">Remove from your friend list</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleBlock}
                  className="flex items-center gap-4 py-3 active:opacity-70 transition-opacity hover:cursor-pointer text-left"
                >
                  <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="size-5 fill-red-600/70"
                    >
                      <path d="M431.2 476.5L163.5 208.8C141.1 240.2 128 278.6 128 320C128 426 214 512 320 512C361.5 512 399.9 498.9 431.2 476.5zM476.5 431.2C498.9 399.8 512 361.4 512 320C512 214 426 128 320 128C278.5 128 240.1 141.1 208.8 163.5L476.5 431.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z" />
                    </svg>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-red-600/85 leading-tight">Block User</span>
                    <span className="text-xs text-red-600/50">Prevent messages from this user</span>
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SectionLayout>
  );
}
