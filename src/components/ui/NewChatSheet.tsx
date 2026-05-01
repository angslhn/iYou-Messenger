import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../stores/useChatStore';

import api from '../../lib/axios';
import initialName from '../../helpers/initial-name';

import BottomSheet from './BottomSheet';
import EmptyState from './EmptyState';

import type { JSX } from 'react';
import type { UserData } from '../../@types/globals';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type FriendshipRelation = {
  friendshipId: string;
  user: Pick<
    UserData,
    'id' | 'username' | 'fullname' | 'about' | 'avatar_url' | 'is_online' | 'last_seen'
  >;
};

export default function NewChatSheet({ isOpen, onClose }: Props): JSX.Element | null {
  const [friends, setFriends] = useState<FriendshipRelation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);

      try {
        const { data } = await api.get<FriendshipRelation[]>('/friendships');

        if (isMounted) setFriends(data);
      } catch {
        /** empty */
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenChat = (friend: FriendshipRelation) => {
    setActiveChat({
      id: '',
      name: friend.user.fullname ?? friend.user.username,
      avatar_url: friend.user.avatar_url,
      description: friend.user.about,
      type: 'private',
      participant_id: '',
      target_user_id: friend.user.id,
      is_pinned: false,
      is_muted: false,
      is_archived: false,
      role: 'peer',
      last_seen: friend.user.last_seen,
      created_at: new Date().toISOString(),
      last_cleared_at: null,
      unread_count: 0,
      last_message: null,
    });

    onClose();
    navigate('/chat/open');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="shrink-0 pt-2">
        <h2 className="font-semibold text-lg text-platinum/85">New Message</h2>
        <p className="text-xs text-platinum/50 mt-1">Select a friend to start chatting</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2 rounded-2xl animate-pulse">
                <div className="size-12 rounded-full bg-ebony-light/50 shrink-0" />
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-4 w-1/2 bg-ebony-light/50 rounded-md" />
                  <div className="h-3 w-1/3 bg-ebony-light/50 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <EmptyState
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-7 fill-platinum/85"
              >
                <path d="M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312z" />
              </svg>
            }
            title="No friends yet"
            description="Search or add friends via Username, PIN, or Phone"
          />
        ) : (
          friends.map((friend) => {
            const { id, fullname, username, avatar_url } = friend.user;
            return (
              <article
                key={id}
                onClick={() => handleOpenChat(friend)}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-ebony-light/50 active:bg-ebony-light transition-colors cursor-pointer group"
              >
                <div className="relative size-12 shrink-0">
                  <div className="size-full flex justify-center items-center rounded-full bg-ebony-light border border-platinum/10 overflow-hidden">
                    {avatar_url ? (
                      <img src={avatar_url} alt="avatar" className="size-full object-cover" />
                    ) : (
                      <span className="font-bold text-xl text-platinum/70">
                        {initialName(fullname ?? username)}
                      </span>
                    )}
                  </div>
                  {friend.user.is_online && (
                    <div className="absolute -top-0.5 -right-0.5 size-3.5 bg-green-500 rounded-full border-2 border-dark-deep" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-platinum/85 truncate">
                    {fullname ?? username}
                  </span>
                  {fullname && (
                    <span className="text-xs font-semibold text-platinum/40 truncate">
                      @{username}
                    </span>
                  )}
                </div>
                <div className="shrink-0 pl-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="size-3 fill-platinum"
                  >
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </div>
              </article>
            );
          })
        )}
      </div>
    </BottomSheet>
  );
}
