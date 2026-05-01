import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../lib/axios';
import initialName from '../../../helpers/initial-name';
import ws from '../../../lib/ws';

import { useChatStore } from '../../../stores/useChatStore';
import { useSocialStore } from '../../../stores/useSocialStore';

import RootLayout from '../../../components/layouts/RootLayout';
import MainLayout from '../../../components/layouts/MainLayout';

import CreateGroupSheet from '../../../components/ui/CreateGroupSheet';
import JoinGroupSheet from '../../../components/ui/JoinGroupSheet';
import GroupActionFab from '../../../components/ui/GroupActionFab';
import ChatListMenu from '../../../components/ui/ChatListMenu';
import GroupIcon from '../../../components/icons/GroupIcon';
import PinnedIcon from '../../../components/icons/PinnedIcon';

import EmptyState from '../../../components/ui/EmptyState';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import type { JSX, MouseEvent } from 'react';
import type { ConversationResponse } from '../../../@types/globals';

type GroupCategories = 'My Groups' | 'Invited';

export type GroupItem = {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  type: 'group';
  role: 'admin' | 'member';
};

type GroupInviteItem = {
  invite_id: string;
  conversation_id: string;
  group_name: string;
  inviter_username: string;
  inviter_fullname: string | null;
  created_at: string;
};

const categories: GroupCategories[] = ['My Groups', 'Invited'];

export default function Group(): JSX.Element {
  const [selected, setSelected] = useState<GroupCategories>('My Groups');
  const [createSheetOpen, setCreateSheetOpen] = useState<boolean>(false);
  const [joinSheetOpen, setJoinSheetOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [invites, setInvites] = useState<GroupInviteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const decrementInvites = useSocialStore((state) => state.decrementInvites);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        if (selected === 'My Groups') {
          const {
            data: {
              conversations,
              meta: { archivedCount },
            },
          } = await api.get<ConversationResponse>('/conversations/group');

          const formattedGroups: GroupItem[] = conversations.map((conversation) => {
            const messageTime = conversation.last_message
              ? new Date(conversation.last_message.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : undefined;

            return {
              id: conversation.id,
              name: conversation.name || 'Unnamed Group',
              avatar_url: conversation.avatar_url,
              description: conversation.description,
              isPinned: conversation.is_pinned,
              isArchived: conversation.is_archived,
              isMuted: conversation.is_muted,
              lastMessage: conversation.last_message
                ? conversation.last_message.content
                : 'No messages yet',
              time: messageTime,
              unreadCount: conversation.unread_count,
              type: 'group',
              role: conversation.role as 'admin' | 'member',
            };
          });

          setArchivedCount(archivedCount);
          setGroups(formattedGroups);
        } else if (selected === 'Invited') {
          const { data } = await api.get('/conversations/invites');

          setInvites(data);
        }
      } catch {
        /** empty */
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selected, refreshTrigger]);

  useEffect(() => {
    const handleNewInvite = ({
      inviteId,
      conversationId,
      groupName,
      inviterUsername,
      inviterFullname,
    }: {
      inviteId: string;
      conversationId: string;
      groupName: string;
      inviterUsername: string;
      inviterFullname: string | null;
    }) => {
      const newInvite: GroupInviteItem = {
        invite_id: inviteId,
        conversation_id: conversationId,
        group_name: groupName,
        inviter_username: inviterUsername,
        inviter_fullname: inviterFullname || null,
        created_at: new Date().toISOString(),
      };

      // Tambahkan undangan baru ke posisi paling atas
      setInvites((prev) => [newInvite, ...prev]);
    };

    ws.on('group:invite_received', handleNewInvite);

    return () => {
      ws.off('group:invite_received', handleNewInvite);
    };
  }, []);

  const handleLongPressStart = (group: GroupItem) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedGroup(group);
      setMenuOpen(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleOpenChat = (group: GroupItem) => {
    setActiveChat({
      id: group.id,
      name: group.name,
      avatar_url: group.avatar_url,
      description: group.description,
      type: group.type,
      role: group.role,
      is_pinned: group.isPinned,
      is_muted: group.isMuted,
      is_archived: group.isArchived,
      created_at: new Date().toISOString(),
      last_cleared_at: null,
      unread_count: group.unreadCount || 0,
      last_message: null,
    });

    navigate('/group/open');
  };

  const handleContextMenu = (group: GroupItem) => (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSelectedGroup(group);
    setMenuOpen(true);
  };

  const handlePin = async (groupId: string, currentPinStatus: boolean) => {
    const newValue = !currentPinStatus;

    setGroups((prevGroups) => {
      const updatedGroups = prevGroups.map((g) =>
        g.id === groupId ? { ...g, isPinned: newValue } : g,
      );

      return updatedGroups.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
    });

    try {
      await api.patch(`/conversations/${groupId}/pin`, { value: newValue });
    } catch {
      setGroups((prevGroups) =>
        prevGroups.map((g) => (g.id === groupId ? { ...g, isPinned: currentPinStatus } : g)),
      );
    }
  };

  const handleArchive = async (groupToArchive: GroupItem) => {
    const newValue = !groupToArchive.isArchived;

    setGroups((prevGroups) =>
      prevGroups.map((g) => (g.id === groupToArchive.id ? { ...g, isArchived: newValue } : g)),
    );

    try {
      await api.patch(`/conversations/${groupToArchive.id}/archive`, { value: newValue });
      setRefreshTrigger((prev) => prev + 1);
    } catch {
      setGroups((prevGroups) =>
        prevGroups.map((g) => (g.id === groupToArchive.id ? { ...g, isArchived: !newValue } : g)),
      );
    }
  };

  const handleMute = async (groupId: string, currentMuteStatus: boolean) => {
    const newValue = !currentMuteStatus;

    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isMuted: newValue } : g)));

    try {
      await api.patch(`/conversations/${groupId}/mute`, { value: newValue });
    } catch {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, isMuted: currentMuteStatus } : g)),
      );
    }
  };

  const handleClearChat = async (groupToClear: GroupItem) => {
    const previousGroups = [...groups];

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupToClear.id
          ? {
              ...g,
              lastMessage: 'No messages yet',
              time: undefined,
              unreadCount: 0,
            }
          : g,
      ),
    );

    try {
      await api.patch(`/conversations/${groupToClear.id}/clear`);
      setMenuOpen(false);
    } catch {
      setGroups(previousGroups);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await api.patch(`/conversations/invites/${inviteId}/accept`);

      setInvites((prev) => prev.filter((inv) => inv.invite_id !== inviteId));
      setRefreshTrigger((prev) => prev + 1);

      decrementInvites();
    } catch {
      /** empty */
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      await api.patch(`/conversations/invites/${inviteId}/reject`);

      setInvites((prev) => prev.filter((inv) => inv.invite_id !== inviteId));

      decrementInvites();
    } catch {
      /** empty */
    }
  };

  const renderGroupItem = (group: GroupItem) => (
    <article
      key={group.id}
      onMouseDown={() => handleLongPressStart(group)}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={() => handleLongPressStart(group)}
      onTouchEnd={handleLongPressEnd}
      onClick={() => handleOpenChat(group)}
      onContextMenu={handleContextMenu(group)}
      className="flex items-center gap-3 py-2 border-b border-ebony-light select-none active:opacity-70 transition-opacity hover:cursor-pointer"
    >
      <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
        {group.name && !group.avatar_url ? (
          <span className="font-bold text-2xl text-platinum/85 select-none" aria-hidden="true">
            {initialName(group.name ?? '')}
          </span>
        ) : (
          group.avatar_url && (
            <img
              src={group.avatar_url}
              alt={`Avatar ${group?.name}`}
              draggable={false}
              className="w-full h-full object-cover rounded-full"
            />
          )
        )}
      </div>
      <div className="w-full min-w-0 flex justify-between">
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold truncate">{group.name}</h3>
          <p
            className={`font-medium text-xs truncate ${group.lastMessage === 'No messages yet' ? 'text-platinum/40 italic' : 'text-platinum/70'}`}
          >
            {group.lastMessage}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between gap-1 py-0.5 shrink-0">
          <time
            className={`text-xs select-none ${group.unreadCount ? 'text-platinum/85 font-semibold' : 'text-platinum/70'}`}
          >
            {group.time}
          </time>
          <div className="flex items-center gap-1">
            {group.isPinned && !group.unreadCount && <PinnedIcon />}
            {group.isMuted && !group.unreadCount && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-3.5 fill-platinum/40"
              >
                <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.4 479.7C530.6 477.3 543.9 462.4 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 99.2C249.4 107 215.8 128.8 192.8 158.9L73 39.1zM160 277.6C160 325.7 143.6 372.4 113.6 410L103.8 422.2C98.8 428.5 96 436.3 96 444.4C96 464 111.9 479.9 131.5 479.9L366.8 479.9L159.9 273L159.9 277.5zM320 576C349.8 576 374.9 555.6 382 528L258 528C265.1 555.6 290.2 576 320 576z" />
              </svg>
            )}
            {group.unreadCount ? (
              <span className="flex justify-center items-center px-1.5 min-w-5 h-5 rounded-full bg-platinum/85 text-dark-charcoal text-[10px] font-bold">
                {group.unreadCount > 99 ? '99+' : group.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );

  const renderGroupInvites = (invite: GroupInviteItem) => {
    const inviteDate = new Date(invite.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    return (
      <article
        key={invite.invite_id}
        className="flex items-center gap-3 py-2 border-b border-ebony-light"
      >
        <div className="size-14 shrink-0 flex justify-center items-center rounded-2xl bg-dark-deep border border-ebony-light">
          <GroupIcon />
        </div>
        <div className="w-full min-w-0 flex justify-between">
          <div className="flex flex-col justify-center overflow-hidden">
            <h3 className="font-semibold truncate">{invite.group_name}</h3>
            <p className="font-medium text-xs text-platinum/70 truncate">
              Invited by {invite.inviter_fullname ?? invite.inviter_username}
            </p>
          </div>
          <div className="h-full flex flex-col justify-baseline items-center gap-1 shrink-0 py-1">
            <time className="m-1 shrink-0 text-[10px] text-platinum/70 select-none">
              {inviteDate}
            </time>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleRejectInvite(invite.invite_id)}
                className="size-7 flex justify-center items-center rounded-full bg-dark-charcoal border border-ebony-light outline-none hover:cursor-pointer active:scale-95 transition-transform"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="size-4 fill-ebony-light"
                >
                  <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAcceptInvite(invite.invite_id)}
                className="size-7 flex justify-center items-center rounded-full border-none outline-none bg-platinum/85 text-dark-charcoal hover:cursor-pointer active:scale-95 transition-transform"
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
          </div>
        </div>
      </article>
    );
  };

  const visibleGroups = groups
    .filter((g) => !g.isArchived)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  const displayGroups = searchQuery.trim()
    ? visibleGroups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : visibleGroups;

  return (
    <RootLayout>
      <MainLayout>
        <div className="flex flex-col gap-4 pt-2">
          <nav
            aria-label="Group Categories"
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
                {label === 'Invited' && invites.length > 0 && (
                  <span
                    className={`relative -top-0.5 ml-1.5 inline-flex justify-center items-center min-w-4 h-4 rounded-full px-1 text-[9px] font-bold leading-none ${
                      selected === label
                        ? 'bg-dark-charcoal text-platinum/85'
                        : 'bg-platinum/75 text-dark-charcoal'
                    }`}
                  >
                    {invites.length > 9 ? '9+' : invites.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          {selected === 'My Groups' && (
            <div className="flex flex-col gap-2">
              <div className="relative w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4.5 absolute left-3 top-1/2 -translate-y-1/2 fill-platinum/50 pointer-events-none"
                >
                  <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 outline-none border border-ebony-light rounded-xl pr-10 pl-10 bg-dark-deep text-platinum/85 text-sm placeholder:text-platinum/60 focus:border-platinum/40 focus:ring-1 focus:ring-platinum/10 transition-all"
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
            </div>
          )}
          <div className="flex-1 flex flex-col text-platinum/85 pb-20">
            {selected === 'My Groups' && (
              <section aria-labelledby="my-groups">
                {isLoading ? (
                  <div className="flex flex-col mt-2">
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                  </div>
                ) : searchQuery.trim() ? (
                  <>
                    <h2 className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none">
                      RESULTS
                    </h2>
                    <div className="flex flex-col mt-2 pb-20">
                      {displayGroups.length > 0 ? (
                        displayGroups.map(renderGroupItem)
                      ) : (
                        <div className="mt-8">
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
                            description={`No groups match "${searchQuery}"`}
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : groups.length === 0 && archivedCount === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="size-8 fill-current"
                        >
                          <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
                        </svg>
                      }
                      title="No groups yet"
                      description="Create a group and invite your friends"
                    />
                  </div>
                ) : (
                  <>
                    <h2
                      id="my-groups"
                      className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                    >
                      MY GROUPS ({groups.length})
                    </h2>

                    {archivedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => navigate('/group/archived')}
                        className="flex items-center gap-3 py-3 mt-2 w-full hover:cursor-pointer active:opacity-70 transition-opacity"
                      >
                        <div className="size-14 shrink-0 flex justify-center items-center rounded-2xl bg-dark-deep border border-ebony-light">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            className="size-6 fill-platinum/50"
                          >
                            <path d="M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z" />
                          </svg>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-platinum/60">Archived Groups</span>
                          <span className="text-xs text-platinum/35">
                            {archivedCount} archived groups
                          </span>
                        </div>
                      </button>
                    )}

                    <div className="flex flex-col mt-2 pb-20">
                      {displayGroups.map(renderGroupItem)}
                    </div>
                  </>
                )}
              </section>
            )}
            {selected === 'Invited' && (
              <section aria-labelledby="invites">
                {isLoading ? (
                  <div className="flex flex-col px-4 mt-2">
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                    <SkeletonItem type="chat" />
                  </div>
                ) : invites.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="size-8 fill-current"
                        >
                          <path d="M320 97.9L128.4 239.8L286.5 357C291.8 360.9 297.7 363.9 304 365.7L304 528C304 533.5 304.5 538.8 305.3 544L128 544C92.7 544 64 515.3 64 480L64 240.1C64 219.8 73.6 200.7 89.9 188.7L286.5 43C296.2 35.8 307.9 32 320 32C332.1 32 343.8 35.9 353.5 43L550.1 188.7C557.3 194 563.2 200.7 567.5 208.3C565 208.1 562.5 208 560 208L468.6 208L320 97.9zM352 304C352 277.5 373.5 256 400 256L560 256C586.5 256 608 277.5 608 304L608 528C608 554.5 586.5 576 560 576L400 576C373.5 576 352 554.5 352 528L352 304zM432 320C418.7 320 408 330.7 408 344C408 357.3 418.7 368 432 368L528 368C541.3 368 552 357.3 552 344C552 330.7 541.3 320 528 320L432 320zM432 416C418.7 416 408 426.7 408 440C408 453.3 418.7 464 432 464L488 464C501.3 464 512 453.3 512 440C512 426.7 501.3 416 488 416L432 416z" />
                        </svg>
                      }
                      title="No invitations"
                      description="Group invitations will appear here"
                    />
                  </div>
                ) : (
                  <>
                    <h2
                      id="invites"
                      className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                    >
                      INVITES ({invites.length})
                    </h2>
                    {invites.map((invite) => renderGroupInvites(invite))}
                  </>
                )}
              </section>
            )}
          </div>
        </div>
        <GroupActionFab
          onCreateClick={() => setCreateSheetOpen(true)}
          onJoinClick={() => setJoinSheetOpen(true)}
        />
        <CreateGroupSheet
          isOpen={createSheetOpen}
          onClose={() => setCreateSheetOpen(false)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
        <JoinGroupSheet
          isOpen={joinSheetOpen}
          onClose={() => setJoinSheetOpen(false)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
        {selectedGroup && (
          <ChatListMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            isGroup={true}
            isPinned={selectedGroup.isPinned}
            isArchived={selectedGroup.isArchived}
            isMuted={selectedGroup.isMuted}
            conversationName={selectedGroup.name}
            onPin={() => handlePin(selectedGroup.id, selectedGroup.isPinned)}
            onArchive={() => handleArchive(selectedGroup)}
            onMute={() => handleMute(selectedGroup.id, selectedGroup.isMuted)}
            onClearChat={() => handleClearChat(selectedGroup)}
          />
        )}
      </MainLayout>
    </RootLayout>
  );
}
