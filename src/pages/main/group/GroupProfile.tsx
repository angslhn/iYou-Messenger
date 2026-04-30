import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../lib/axios';
import initialName from '../../../helpers/initial-name';
import blankAvatar from '../../../assets/images/blank.webp';

import { useAlertStore } from '../../../stores/useAlertStore';
import { useChatStore } from '../../../stores/useChatStore';

import SectionLayout from '../../../components/layouts/SectionLayout';
import ArrowLeftIcon from '../../../components/icons/ArrowLeftIcon';
import ArrowRightIcon from '../../../components/icons/ArrowRightIcon';
import PinMenu from '../../../components/ui/PinMenu';
import EditGroupSheet from '../../../components/ui/EditGroupSheet';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import type { JSX } from 'react';

type GroupMember = {
  id: string;
  username: string;
  fullname: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member' | 'peer';
  is_online: boolean;
  last_seen: string | null;
};

type GroupInfo = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  pin: string | null;
  created_at: string;
  currentUserRole: 'admin' | 'member' | 'peer';
  members: GroupMember[];
};

export default function GroupProfile(): JSX.Element {
  const navigate = useNavigate();
  const { activeChat } = useChatStore();
  const { showAlert } = useAlertStore();

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pinMenuOpen, setPinMenuOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const fetchGroupInfo = useCallback(async () => {
    if (!activeChat?.id) {
      navigate('/group');
      return;
    }

    if (!groupInfo) setIsLoading(true);

    try {
      const { data } = await api.get(`/conversations/${activeChat.id}/info`);
      setGroupInfo(data);
    } catch {
      navigate('/group');
    } finally {
      setIsLoading(false);
    }
  }, [activeChat, navigate, groupInfo]);

  useEffect(() => {
    fetchGroupInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = () => {
    showAlert({
      title: 'Leave Group',
      description:
        'Are you sure you want to leave this group? You will no longer receive new messages from this conversation.',
      confirmText: 'Leave Group',
      isDanger: true,
      onConfirm: async () => {
        if (!groupInfo) return;

        try {
          await api.delete(`/conversations/${groupInfo.id}/leave`);
          navigate('/group');
        } catch {
          /** empty */
        }
      },
    });
  };

  const handleDelete = () => {
    showAlert({
      title: 'Delete Group',
      description:
        'Are you sure you want to permanently delete this group? All messages, media, and data will be erased for everyone. This action cannot be undone.',
      confirmText: 'Delete Group',
      isDanger: true,
      onConfirm: async () => {
        if (!groupInfo) return;

        try {
          await api.delete(`/conversations/${groupInfo.id}/group`);
          navigate('/group');
        } catch {
          /** empty */
        }
      },
    });
  };

  const handleGeneratePin = async () => {
    if (!groupInfo) return;

    try {
      const { data } = await api.patch(`/conversations/${groupInfo.id}/generate/pin`);

      setGroupInfo({ ...groupInfo, pin: data.pin });
    } catch {
      /** empty */
    }
  };

  const handleDeletePin = async () => {
    if (!groupInfo) return;

    try {
      await api.delete(`/conversations/${groupInfo.id}/pin`);

      setGroupInfo({ ...groupInfo, pin: null });
    } catch {
      /** empty */
    }
  };

  if (isLoading || !groupInfo) {
    return (
      <SectionLayout>
        <nav className="h-14 flex items-center gap-4 px-5 border-b border-ebony-light shrink-0">
          <button
            type="button"
            onClick={() => navigate('/group/open')}
            className="hover:cursor-pointer"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="font-semibold text-platinum/85">Group Info</h1>
        </nav>
        <div className="flex flex-col px-4 mt-8">
          <SkeletonItem type="chat" />
          <SkeletonItem type="chat" />
        </div>
      </SectionLayout>
    );
  }

  const isAdmin = groupInfo.currentUserRole === 'admin';

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-5 border-b border-ebony-light shrink-0">
        <button
          type="button"
          onClick={() => navigate('/group/open')}
          className="hover:cursor-pointer"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-platinum/85">Group Info</h1>
      </nav>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
        <div className="flex flex-col items-center gap-2 py-4 px-5 border-b border-ebony-light">
          <div className="size-24 flex justify-center items-center rounded-full bg-dark-deep border-2 border-ebony-light">
            {groupInfo?.name && !groupInfo.avatar_url ? (
              <span className="font-bold text-3xl text-platinum/85 select-none" aria-hidden="true">
                {groupInfo.name.charAt(0)}
              </span>
            ) : (
              <img
                src={groupInfo?.avatar_url ?? blankAvatar}
                alt={`Avatar ${groupInfo?.name}`}
                draggable={false}
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <h2 className="font-bold text-xl text-platinum/85 select-none">{groupInfo.name}</h2>
            <span className="text-xs text-platinum/50 select-none">
              {groupInfo.members.length} members
            </span>
          </div>
          {groupInfo.description && (
            <p className="mt-1 text-center text-sm text-platinum/80 leading-relaxed px-6 select-none">
              {groupInfo.description}
            </p>
          )}
        </div>
        <div className="flex flex-col px-5 py-4 border-b border-ebony-light">
          <h3 className="font-semibold text-xs text-platinum/50 tracking-wider mb-3">
            MEMBERS ({groupInfo.members.length})
          </h3>
          <div className="flex flex-col gap-1">
            {groupInfo.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 py-2.5 border-b border-ebony-light last:border-0"
              >
                <div className="relative size-12 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                  <div className="relative size-12 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light shadow-inner overflow-hidden">
                    {member?.fullname && !member.avatar_url ? (
                      <span
                        className="font-bold text-xl text-platinum/85 select-none"
                        aria-hidden="true"
                      >
                        {initialName(member.fullname)}
                      </span>
                    ) : (
                      <img
                        src={member?.avatar_url ?? blankAvatar}
                        alt={`Avatar ${member?.fullname || member?.username}`}
                        draggable={false}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-dark-charcoal ${member.is_online ? 'bg-green-400' : 'bg-platinum/30'}`}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm text-platinum/85 truncate">
                    {member.fullname ?? member.username}
                  </span>
                  <span className="text-xs text-platinum/40 truncate">@{member.username}</span>
                </div>
                {member.role === 'admin' && (
                  <span className="shrink-0 px-2 py-0.5 rounded-lg bg-platinum/10 border border-platinum/20 text-xs font-semibold text-platinum/60">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col px-5 py-4 gap-0.5">
          <h3 className="font-semibold text-xs text-platinum/50 tracking-wider">ACTIONS</h3>
          {isAdmin && (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEditSheetOpen(true)}
                  className="group flex items-center gap-4 py-3 border-b border-ebony-light w-full text-left active:opacity-70 transition-all hover:cursor-pointer"
                >
                  <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="size-4 fill-platinum/70"
                    >
                      <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                    </svg>
                  </div>
                  <div className="flex flex-col flex-1 items-center min-w-0 pr-1.5">
                    <h3 className="font-bold text-platinum/85 leading-tight">Edit Group Info</h3>
                    <span className="text-xs text-platinum/50 truncate">
                      Change name, description & avatar
                    </span>
                  </div>
                  <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon />
                  </div>
                </button>
              </div>
              {groupInfo.pin ? (
                <div className="relative flex justify-baseline items-center gap-4 py-3 border-b border-ebony-light">
                  <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      className="size-5 fill-platinum/70"
                    >
                      <path d="M112,112h32v32H112ZM224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Zm-64,96V112h32a8,8,0,0,0,0-16H160V64a8,8,0,0,0-16,0V96H112V64a8,8,0,0,0-16,0V96H64a8,8,0,0,0,0,16H96v32H64a8,8,0,0,0,0,16H96v32a8,8,0,0,0,16,0V160h32v32a8,8,0,0,0,16,0V160h32a8,8,0,0,0,0-16Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 pr-1.5 items-center">
                    <h3 className="font-bold text-platinum/85 leading-tight">PIN</h3>
                    <span className="text-platinum/50 text-sm tracking-widest font-semibold">
                      {groupInfo.pin}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPinMenuOpen(true)}
                    className="absolute right-1 p-2 rounded-full bg-dark-deep border border-ebony-light hover:cursor-pointer active:scale-95 transition-transform"
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
                  className="group relative flex items-center gap-4 py-3 border-b border-ebony-light w-full text-left active:opacity-70 transition-all hover:cursor-pointer"
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
                  <div className="flex flex-col flex-1 items-center pr-1.5 min-w-0">
                    <h3 className="font-bold text-platinum/85 leading-tight">PIN</h3>
                    <span className="text-platinum/50 text-xs">Tap to generate PIN</span>
                  </div>
                  <div className="absolute right-0 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon />
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-4 py-3 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
              >
                <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="size-5 fill-red-600/70"
                  >
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                  </svg>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-red-600/85 leading-tight">Delete Group</span>
                  <span className="text-xs text-red-600/50">Permanently remove this group</span>
                </div>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleLeave}
            className="flex items-center gap-4 py-3 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
          >
            <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="size-5 fill-red-600/70"
              >
                <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z" />
              </svg>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="font-bold text-red-600/85 leading-tight">Leave Group</h3>
              <span className="text-xs text-red-600/50">Exit this group conversation</span>
            </div>
          </button>
        </div>
      </div>
      <EditGroupSheet
        isOpen={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        groupData={groupInfo}
        onSuccess={fetchGroupInfo}
      />
      <PinMenu
        isOpen={pinMenuOpen}
        onClose={() => setPinMenuOpen(false)}
        pin={groupInfo.pin ?? ''}
        onCopy={() => {
          navigator.clipboard.writeText(groupInfo.pin ?? '');
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
    </SectionLayout>
  );
}
