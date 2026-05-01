import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../lib/axios';
import initialName from '../../helpers/initial-name';
import ws from '../../lib/ws';

import { useSocialStore } from '../../stores/useSocialStore';

import RootLayout from '../../components/layouts/RootLayout';
import MainLayout from '../../components/layouts/MainLayout';

import FindFriendSheet from '../../components/ui/FindFriendSheet';
import FriendMenu from '../../components/ui/FriendMenu';
import SkeletonItem from '../../components/ui/SkeletonItem';
import EmptyState from '../../components/ui/EmptyState';

import type { JSX } from 'react';
import type { UserData } from '../../@types/globals';

type FriendCategories = 'My Friends' | 'Requests' | 'Blocked';

const categories: FriendCategories[] = ['My Friends', 'Requests', 'Blocked'];

type FriendshipRelation = {
  friendshipId: string;
  user: Pick<
    UserData,
    'id' | 'username' | 'fullname' | 'about' | 'avatar_url' | 'is_online' | 'last_seen'
  >;
};

export default function Friend(): JSX.Element {
  const [selected, setSelected] = useState<FriendCategories>('My Friends');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendshipRelation | null>(null);

  const [friends, setFriends] = useState<FriendshipRelation[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendshipRelation[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<FriendshipRelation[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const decrementRequests = useSocialStore((state) => state.decrementRequests);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);

      try {
        if (selected === 'My Friends') {
          const { data } = await api.get<FriendshipRelation[]>('/friendships');

          if (isMounted) setFriends(data);
        } else if (selected === 'Requests') {
          const { data } = await api.get<FriendshipRelation[]>('/friendships/requests');

          if (isMounted) setFriendRequests(data);
        } else if (selected === 'Blocked') {
          const { data } = await api.get<FriendshipRelation[]>('/friendships/blocked');

          if (isMounted) setBlockedUsers(data);
        }
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
  }, [selected]);

  useEffect(() => {
    const handleNewRequest = ({
      friendshipId,
      requesterId,
      requesterUsername,
      requesterFullname,
      requesterAvatarUrl,
    }: {
      friendshipId: string;
      requesterId: string;
      requesterUsername: string;
      requesterFullname: string | null;
      requesterAvatarUrl: string | null;
    }) => {
      if (selected !== 'Requests') return;

      const newRequest: FriendshipRelation = {
        friendshipId: friendshipId,
        user: {
          id: requesterId,
          username: requesterUsername,
          fullname: requesterFullname,
          avatar_url: requesterAvatarUrl,
          about: null,
          is_online: false,
          last_seen: null,
        },
      };

      setFriendRequests((prev) => [newRequest, ...prev]);
    };

    const handleNewFriend = ({
      friendshipId,
      friendId,
      friendUsername,
      friendFullname,
      friendAvatarUrl,
    }: {
      friendshipId: string;
      friendId: string;
      friendUsername: string;
      friendFullname: string | null;
      friendAvatarUrl: string | null;
    }) => {
      if (selected !== 'My Friends') return;

      const newFriend: FriendshipRelation = {
        friendshipId: friendshipId,
        user: {
          id: friendId,
          username: friendUsername,
          fullname: friendFullname || null,
          avatar_url: friendAvatarUrl || null,
          about: null,
          is_online: true,
          last_seen: null,
        },
      };

      setFriends((prev) => [newFriend, ...prev]);
    };

    ws.on('friend:request_received', handleNewRequest);
    ws.on('friend:new_friend', handleNewFriend);

    return () => {
      ws.off('friend:request_received', handleNewRequest);
      ws.off('friend:new_friend', handleNewFriend);
    };
  }, [selected]);

  const filteredResults =
    searchQuery.trim().length >= 2
      ? friends.filter(
          (data) =>
            data.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (data.user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
        )
      : [];

  const handleOpenFriendMenu = (friend: FriendshipRelation) => {
    setSelectedFriend(friend);
    setFriendMenuOpen(true);
  };

  const handleProfile = () => {
    if (!selectedFriend) return;

    navigate(`/user/${selectedFriend.user.id}`);
  };

  const handleUnfriend = async () => {
    if (!selectedFriend) return;
    try {
      await api.delete(`/friendships/${selectedFriend.friendshipId}`);
      // 🚀 Langsung hapus dari layar tanpa refresh
      setFriends((prev) => prev.filter((f) => f.friendshipId !== selectedFriend.friendshipId));
      setFriendMenuOpen(false);
    } catch {
      /** empty */
    }
  };

  const handleBlock = async () => {
    if (!selectedFriend) return;
    try {
      await api.patch(`/friendships/block/${selectedFriend.user.id}`);

      setFriends((prev) => prev.filter((f) => f.friendshipId !== selectedFriend.friendshipId));
      setFriendMenuOpen(false);
    } catch {
      /** empty */
    }
  };

  const handleUnblock = async (friendshipId: string) => {
    try {
      await api.patch(`/friendships/${friendshipId}/unblock`);

      setBlockedUsers((prev) => prev.filter((b) => b.friendshipId !== friendshipId));
    } catch {
      /** empty */
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      await api.patch(`/friendships/${friendshipId}/accept`);

      setFriendRequests((prev) => prev.filter((req) => req.friendshipId !== friendshipId));
      decrementRequests();
    } catch {
      /** empty */
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      await api.patch(`/friendships/${friendshipId}/reject`);

      setFriendRequests((prev) => prev.filter((req) => req.friendshipId !== friendshipId));
      decrementRequests();
    } catch {
      /** empty */
    }
  };

  return (
    <RootLayout>
      <MainLayout>
        <div className="flex flex-col gap-4 pt-2">
          <nav
            aria-label="Friend Categories"
            className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]"
          >
            {categories.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setSelected(label)}
                className={`shrink-0 px-4 py-1.5 relative ${
                  selected === label
                    ? 'border-none bg-platinum/85 text-dark-charcoal'
                    : 'border border-ebony-light text-platinum/85'
                } rounded-2xl font-semibold text-sm text-center select-none hover:cursor-pointer transition-colors`}
              >
                {label}
                {label === 'Requests' && friendRequests.length > 0 && (
                  <span
                    className={`relative -top-0.5 ml-1.5 inline-flex justify-center items-center min-w-4 h-4 rounded-full px-1 text-[9px] font-bold leading-none ${
                      selected === label
                        ? 'bg-dark-charcoal text-platinum/85'
                        : 'bg-platinum/75 text-dark-charcoal'
                    }`}
                  >
                    {friendRequests.length > 9 ? '9+' : friendRequests.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          {selected === 'My Friends' && (
            <div className="flex gap-2 items-center h-14">
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4.5 absolute left-3 top-1/2 -translate-y-1/2 fill-platinum/50 pointer-events-none"
                >
                  <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 outline-none border border-ebony-light rounded-xl pr-4 pl-10 bg-dark-deep text-platinum/85 text-sm placeholder:text-platinum/60 focus:border-platinum/40 focus:ring-1 focus:ring-platinum/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      className="size-4 fill-platinum/40"
                    >
                      <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="shrink-0 size-12 flex justify-center items-center rounded-xl bg-dark-deep border border-ebony-light hover:cursor-pointer active:scale-95 transition-transform"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="size-5 fill-platinum/85"
                >
                  <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col mt-2 text-platinum/85 pb-20">
          {selected === 'My Friends' && searchQuery.trim().length >= 2 ? (
            <div className="flex flex-col">
              <h2 className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none">
                RESULTS
              </h2>
              {filteredResults.length > 0 ? (
                filteredResults.map((data) => (
                  <article
                    key={data.user.id}
                    className="flex items-center gap-3 py-2 border-b border-ebony-light"
                  >
                    <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                      <span className="font-bold text-[1.1rem] select-none">
                        {initialName(data.user.fullname ?? data.user.username)}
                      </span>
                    </div>
                    <div className="w-full min-w-0 flex items-center justify-between">
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="font-semibold truncate">
                          {data.user.fullname ?? data.user.username}
                        </h3>
                        <span className="font-medium text-xs text-platinum/70 truncate">
                          @{data.user.username}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenFriendMenu(data)}
                        className="size-10 flex justify-center items-center hover:cursor-pointer active:scale-95 transition-transform"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 256 256"
                          className="w-5 fill-platinum/85"
                        >
                          <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM48,100a28,28,0,1,0,28,28A28,28,0,0,0,48,100Zm160,0a28,28,0,1,0,28,28A28,28,0,0,0,208,100Z" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="mt-4">
                  <EmptyState
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        className="size-6 fill-current"
                      >
                        <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
                      </svg>
                    }
                    title="No results found"
                    description={`No usernames from friends match "${searchQuery}"`}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {selected === 'My Friends' && (
                <section aria-labelledby="my-friends">
                  {isLoading ? (
                    <div className="flex flex-col mt-2">
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="mt-6">
                      <EmptyState
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            className="size-7 fill-current"
                          >
                            <path d="M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM528 144C541.3 144 552 154.7 552 168L552 216L600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L552 264L552 312C552 325.3 541.3 336 528 336C514.7 336 504 325.3 504 312L504 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L504 216L504 168C504 154.7 514.7 144 528 144zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312z" />
                          </svg>
                        }
                        title="No friends yet"
                        description="Search or add friends via Username, PIN, or Phone"
                      />
                    </div>
                  ) : (
                    <>
                      <h2
                        id="my-friends"
                        className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                      >
                        MY FRIENDS ({friends.length})
                      </h2>
                      {friends.map((data) => (
                        <article
                          key={data.user.id}
                          className="flex items-center gap-3 py-2 border-b border-ebony-light"
                        >
                          <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                            {data.user.avatar_url ? (
                              <img
                                src={data.user.avatar_url}
                                alt={'Avatar ' + data.user.fullname}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="font-bold text-[1.1rem] select-none text-platinum/85">
                                {data.user.fullname?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="w-full min-w-0 flex items-center justify-between">
                            <div className="flex flex-col overflow-hidden">
                              <h3 className="font-semibold truncate">
                                {data.user.fullname ?? data.user.username}
                              </h3>
                              <span className="font-medium text-xs text-platinum/70 truncate">
                                @{data.user.username}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenFriendMenu(data)}
                              className="size-10 flex justify-center items-center hover:cursor-pointer active:scale-95 transition-transform"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                className="w-5 fill-platinum/85"
                              >
                                <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM48,100a28,28,0,1,0,28,28A28,28,0,0,0,48,100Zm160,0a28,28,0,1,0,28,28A28,28,0,0,0,208,100Z" />
                              </svg>
                            </button>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                </section>
              )}
              {selected === 'Requests' && (
                <section aria-labelledby="requests">
                  {isLoading ? (
                    <div className="flex flex-col mt-2">
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                    </div>
                  ) : friendRequests.length === 0 ? (
                    <div className="mt-6">
                      <EmptyState
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            className="size-7 fill-current"
                          >
                            <path d="M320 97.9L128.4 239.8L286.5 357C291.8 360.9 297.7 363.9 304 365.7L304 528C304 533.5 304.5 538.8 305.3 544L128 544C92.7 544 64 515.3 64 480L64 240.1C64 219.8 73.6 200.7 89.9 188.7L286.5 43C296.2 35.8 307.9 32 320 32C332.1 32 343.8 35.9 353.5 43L550.1 188.7C557.3 194 563.2 200.7 567.5 208.3C565 208.1 562.5 208 560 208L468.6 208L320 97.9zM352 304C352 277.5 373.5 256 400 256L560 256C586.5 256 608 277.5 608 304L608 528C608 554.5 586.5 576 560 576L400 576C373.5 576 352 554.5 352 528L352 304zM432 320C418.7 320 408 330.7 408 344C408 357.3 418.7 368 432 368L528 368C541.3 368 552 357.3 552 344C552 330.7 541.3 320 528 320L432 320zM432 416C418.7 416 408 426.7 408 440C408 453.3 418.7 464 432 464L488 464C501.3 464 512 453.3 512 440C512 426.7 501.3 416 488 416L432 416z" />
                          </svg>
                        }
                        title="No pending requests"
                        description="Incoming requests will appear here"
                      />
                    </div>
                  ) : (
                    <>
                      <h2
                        id="requests"
                        className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                      >
                        REQUESTS ({friendRequests.length})
                      </h2>
                      {friendRequests.map((req) => (
                        <article
                          key={req.user.id}
                          className="flex items-center gap-3 py-2 border-b border-ebony-light"
                        >
                          <button
                            type="button"
                            onClick={() => navigate(`/user/${req.user.id}`)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:cursor-pointer active:opacity-70 transition-opacity"
                          >
                            <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                              {req.user.avatar_url ? (
                                <img
                                  src={req.user.avatar_url}
                                  alt={'Avatar ' + req.user.fullname}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="font-bold text-[1.1rem] select-none text-platinum/85">
                                  {req.user.fullname?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <h3 className="font-semibold truncate">
                                {req.user.fullname ?? req.user.username}
                              </h3>
                              <span className="font-medium text-xs text-platinum/70 truncate">
                                @{req.user.username}
                              </span>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleReject(req.friendshipId)}
                              className="size-8 flex justify-center items-center rounded-full bg-dark-charcoal border border-ebony-light outline-none hover:cursor-pointer active:scale-95 transition-transform"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                className="size-4 fill-platinum/50"
                              >
                                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAccept(req.friendshipId)}
                              className="size-8 flex justify-center items-center rounded-full bg-platinum/85 outline-none hover:cursor-pointer active:scale-95 transition-transform"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 256 256"
                                className="size-4 fill-dark-charcoal"
                              >
                                <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z" />
                              </svg>
                            </button>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                </section>
              )}
              {selected === 'Blocked' && (
                <section aria-labelledby="blocked">
                  {isLoading ? (
                    <div className="flex flex-col mt-2">
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                      <SkeletonItem type="friend" />
                    </div>
                  ) : blockedUsers.length === 0 ? (
                    <div className="mt-6">
                      <EmptyState
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            className="size-7 fill-current"
                          >
                            <path d="M431.2 476.5L163.5 208.8C141.1 240.2 128 278.6 128 320C128 426 214 512 320 512C361.5 512 399.9 498.9 431.2 476.5zM476.5 431.2C498.9 399.8 512 361.4 512 320C512 214 426 128 320 128C278.5 128 240.1 141.1 208.8 163.5L476.5 431.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z" />
                          </svg>
                        }
                        title="No blocked users"
                        description="Blocked users will appear here"
                      />
                    </div>
                  ) : (
                    <>
                      <h2
                        id="blocked"
                        className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                      >
                        BLOCKED ({blockedUsers.length})
                      </h2>
                      {blockedUsers.map((blocked) => (
                        <article
                          key={blocked.user.id}
                          className="flex items-center gap-3 py-2 border-b border-ebony-light"
                        >
                          <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                            {blocked.user.avatar_url ? (
                              <img
                                src={blocked.user.avatar_url}
                                alt={'Avatar ' + blocked.user.fullname}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="font-bold text-[1.1rem] select-none text-platinum/85">
                                {blocked.user.fullname?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="w-full min-w-0 flex items-center justify-between">
                            <div className="flex flex-col overflow-hidden">
                              <h3 className="font-semibold truncate">
                                {blocked.user.fullname ?? blocked.user.username}
                              </h3>
                              <span className="font-medium text-xs text-platinum/70 truncate">
                                @{blocked.user.username}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnblock(blocked.friendshipId)}
                              className="shrink-0 px-3 py-1.5 rounded-xl border border-ebony-light text-platinum/70 font-semibold text-xs hover:cursor-pointer active:scale-95 transition-transform"
                            >
                              Unblock
                            </button>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>
        <FindFriendSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
        {selectedFriend && (
          <FriendMenu
            isOpen={friendMenuOpen}
            onClose={() => setFriendMenuOpen(false)}
            friend={selectedFriend.user}
            onProfile={handleProfile}
            onUnfriend={handleUnfriend}
            onBlock={handleBlock}
          />
        )}
      </MainLayout>
    </RootLayout>
  );
}
