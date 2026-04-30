import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../lib/axios';

import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';

import BottomSheet from './BottomSheet';

import type { JSX } from 'react';

type Member = {
  id: string;
  username: string;
  fullname: string | null;
  avatar_url: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onNavigateInfo: () => void;
};

type FriendResponse = {
  friendshipId: string;
  user: {
    id: string;
    username: string;
    fullname: string | null;
    avatar_url: string | null;
  };
};

type GroupInfoResponse = {
  id: string;
  name: string;
  currentUserRole: 'admin' | 'member' | 'peer';
  members: {
    id: string;
    username: string;
    fullname: string | null;
    avatar_url: string | null;
    is_online: boolean;
    last_seen: string | null;
    role: 'admin' | 'member' | 'peer';
  }[];
};

type SubSheet = 'invite' | 'kick' | null;

export default function GroupRoomMenu({
  isOpen,
  onClose,
  isAdmin = false,
  onNavigateInfo,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const activeChat = useChatStore((state) => state.activeChat);

  const [subSheet, setSubSheet] = useState<SubSheet>(null);

  const [friends, setFriends] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    if (!activeChat?.id || !isOpen) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        if (subSheet === 'invite') {
          const [friendsRes, groupRes] = await Promise.all([
            api.get<FriendResponse[]>('/friendships'),
            api.get<GroupInfoResponse>(`/conversations/${activeChat.id}/info`),
          ]);

          const existingMemberIds = new Set(groupRes.data.members.map((m) => m.id));

          const availableFriends = friendsRes.data
            .map((f) => ({
              id: f.user.id,
              username: f.user.username,
              fullname: f.user.fullname,
              avatar_url: f.user.avatar_url,
            }))
            .filter((friend: Member) => !existingMemberIds.has(friend.id));

          setFriends(availableFriends);
        } else if (subSheet === 'kick') {
          const { data } = await api.get<GroupInfoResponse>(`/conversations/${activeChat.id}/info`);

          const groupMembers = data.members.map((m) => ({
            id: m.id,
            username: m.username,
            fullname: m.fullname,
            avatar_url: m.avatar_url,
            is_online: m.is_online,
            last_seen: m.last_seen,
          }));

          setMembers(groupMembers);
        }
      } catch {
        /** empty */
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subSheet, activeChat?.id, isOpen]);

  const handleClearChat = async () => {
    if (!activeChat) return;
    onClose();
    try {
      await api.patch(`/conversations/${activeChat.id}/clear`);
      useChatStore.getState().setMessages(activeChat.id, []);
    } catch {
      console.error('Failed to clear chat');
    }
  };

  const handleInvite = async (memberId: string) => {
    if (!activeChat?.id) return;

    try {
      await api.post(`/conversations/${activeChat.id}/invites`, { targetUserId: memberId });

      setFriends((prev) => prev.filter((f) => f.id !== memberId));
    } catch {
      /** empty */
    }
  };

  const handleKick = async (memberId: string) => {
    if (!activeChat?.id) return;

    try {
      await api.delete(`/conversations/${activeChat.id}/participants/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      /** empty */
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeChat?.id) return;

    try {
      await api.delete(`/conversations/${activeChat.id}/group`);
      setSubSheet(null);
      onClose();
      navigate('/group');
    } catch {
      /** empty */
    }
  };

  const handleClose = () => {
    setSubSheet(null);
    onClose();
  };

  if (subSheet === 'invite') {
    return (
      <BottomSheet isOpen={isOpen} onClose={handleClose} title="Invite Member">
        <div className="flex flex-col gap-1 min-h-32">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-platinum/40 text-sm">Loading friends...</span>
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-1">
              <span className="text-platinum/40 text-sm">No available friends to invite</span>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 py-3 border-b border-ebony-light last:border-0"
              >
                <div className="size-10 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                  {friend.fullname && !friend.avatar_url ? (
                    <span
                      className="font-bold text-3xl text-platinum/85 select-none"
                      aria-hidden="true"
                    >
                      {friend?.fullname?.charAt(0)}
                    </span>
                  ) : (
                    friend.avatar_url && (
                      <img
                        src={friend.avatar_url}
                        alt={`Avatar ${friend?.fullname}`}
                        draggable={false}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm text-platinum/85 truncate">
                    {friend.fullname ?? friend.username}
                  </span>
                  <span className="text-xs text-platinum/40">@{friend.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleInvite(friend.id)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-platinum/85 text-dark-charcoal font-semibold text-xs hover:cursor-pointer active:scale-95 transition-transform"
                >
                  Invite
                </button>
              </div>
            ))
          )}
        </div>
      </BottomSheet>
    );
  }

  if (subSheet === 'kick') {
    const kickableMembers = members.filter((member) => member.id !== user?.id);

    return (
      <BottomSheet isOpen={isOpen} onClose={handleClose} title="Remove Member">
        <div className="flex flex-col gap-1 min-h-32">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-platinum/40 text-sm">Loading members...</span>
            </div>
          ) : kickableMembers.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-1">
              <span className="text-platinum/40 text-sm">No members found</span>
            </div>
          ) : (
            kickableMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 py-3 border-b border-ebony-light last:border-0"
              >
                <div className="size-10 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                  {member.fullname && !member.avatar_url ? (
                    <span
                      className="font-bold text-3xl text-platinum/85 select-none"
                      aria-hidden="true"
                    >
                      {member?.fullname?.charAt(0)}
                    </span>
                  ) : (
                    member.avatar_url && (
                      <img
                        src={member.avatar_url}
                        alt={`Avatar ${member?.fullname}`}
                        draggable={false}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm text-platinum/85 truncate">
                    {member.fullname ?? member.username}
                  </span>
                  <span className="text-xs text-platinum/40">@{member.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleKick(member.id)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-600/30 text-red-500 font-semibold text-xs hover:cursor-pointer active:scale-95 transition-transform"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Group Options">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            onNavigateInfo();
            handleClose();
          }}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-4 fill-platinum/70"
            >
              <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM348 444L292 444L292 388L348 388L348 444zM339.2 352L300.8 352L288 192L352 192L339.2 352z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Group Info</span>
            <span className="text-xs text-platinum/50">Members, description & settings</span>
          </div>
        </button>
        <button
          type="button"
          onClick={handleClearChat}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-4 fill-platinum/70"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Clear Chat</span>
            <span className="text-xs text-platinum/50">Remove all messages for you</span>
          </div>
        </button>
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setSubSheet('invite')}
              className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
            >
              <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-4 fill-platinum/70"
                >
                  <path d="M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-platinum/85 leading-tight">Invite Member</span>
                <span className="text-xs text-platinum/50">Add friends to this group</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSubSheet('kick')}
              className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
            >
              <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-4 fill-red-600/70"
                >
                  <path d="M286.1 368C384.6 368 464.4 447.8 464.4 546.3C464.4 562.7 451.1 576 434.7 576L78.1 576C61.7 576 48.4 562.7 48.4 546.3C48.4 447.8 128.2 368 226.7 368L286.1 368zM562.3 172.1C571.7 162.7 586.9 162.7 596.2 172.1C605.5 181.5 605.6 196.7 596.2 206L562.3 239.9L596.2 273.8C605.6 283.2 605.6 298.4 596.2 307.7C586.8 317 571.6 317.1 562.3 307.7L528.4 273.8L494.5 307.7C485.1 317.1 469.9 317.1 460.6 307.7C451.3 298.3 451.2 283.1 460.6 273.8L494.5 239.9L460.6 206C451.2 196.6 451.2 181.4 460.6 172.1C470 162.8 485.2 162.7 494.5 172.1L528.4 206L562.3 172.1zM256.4 312C190.1 312 136.4 258.3 136.4 192C136.4 125.7 190.1 72 256.4 72C322.7 72 376.4 125.7 376.4 192C376.4 258.3 322.7 312 256.4 312z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-red-600/85 leading-tight">Remove Member</span>
                <span className="text-xs text-red-600/50">Kick a member from this group</span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleDeleteGroup}
              className="flex items-center gap-4 px-1 py-3.5 active:opacity-70 transition-opacity hover:cursor-pointer"
            >
              <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="size-4 fill-red-600/70"
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
      </div>
    </BottomSheet>
  );
}
