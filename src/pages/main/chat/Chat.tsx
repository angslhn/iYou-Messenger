import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../lib/axios';

import { useChatStore } from '../../../stores/useChatStore';

import RootLayout from '../../../components/layouts/RootLayout';
import MainLayout from '../../../components/layouts/MainLayout';

import RecentStories from '../../../components/ui/RecentStories';
import PinnedIcon from '../../../components/icons/PinnedIcon';
import ChatListMenu from '../../../components/ui/ChatListMenu';

import ChatFab from '../../../components/ui/ChatFab';
import EmptyState from '../../../components/ui/EmptyState';
import NewChatSheet from '../../../components/ui/NewChatSheet';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import type { JSX, MouseEvent } from 'react';
import type { ConversationResponse } from '../../../@types/globals';

export type ChatItem = {
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
  type: 'private' | 'group';
  participant_id: string;
  target_user_id?: string | null;
  last_seen?: string | null;
};

export default function Chat(): JSX.Element {
  const navigate = useNavigate();
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);

      try {
        const {
          data: {
            conversations,
            meta: { archivedCount },
          },
        } = await api.get<ConversationResponse>('/conversations/private');

        const formattedChats: ChatItem[] = conversations.map((conversation) => {
          const messageTime = conversation.last_message
            ? new Date(conversation.last_message.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined;

          return {
            id: conversation.id,
            name: conversation.name || 'Unknown User',
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
            type: conversation.type,
            participant_id: conversation.participant_id as string,
            target_user_id: conversation.target_user_id,
            last_seen: conversation.last_seen,
          };
        });

        setChats(formattedChats);
        setArchivedCount(archivedCount);
      } catch {
        /** empty */
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const visibleChats = chats
    .filter((c) => !c.isArchived)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  const pinnedChats = visibleChats.filter((c) => c.isPinned);
  const unpinnedChats = visibleChats.filter((c) => !c.isPinned);

  const displayChats = searchQuery.trim()
    ? visibleChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : visibleChats;

  const hasAnyChat = chats.length > 0;

  const handleOpenChat = (chat: ChatItem) => {
    setActiveChat({
      id: chat.id,
      name: chat.name,
      avatar_url: chat.avatar_url,
      description: chat.description,
      type: chat.type,
      participant_id: chat.participant_id,
      target_user_id: chat.target_user_id,
      is_pinned: chat.isPinned,
      is_muted: chat.isMuted,
      last_seen: chat.last_seen,
      is_archived: chat.isArchived,
      role: 'peer',
      created_at: new Date().toISOString(),
      last_cleared_at: null,
      unread_count: chat.unreadCount || 0,
      last_message: null,
    });

    navigate('/chat/open');
  };

  const handleLongPressStart = (chat: ChatItem) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedChat(chat);
      setMenuOpen(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleContextMenu = (chat: ChatItem) => (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSelectedChat(chat);
    setMenuOpen(true);
  };

  const handlePin = async (chatId: string, currentPinStatus: boolean) => {
    const newValue = !currentPinStatus;
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, isPinned: newValue } : c)));

    try {
      await api.patch(`/conversations/${chatId}/pin`, { value: newValue });
    } catch {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isPinned: currentPinStatus } : c)),
      );
    }
  };

  const handleArchive = async (chatToArchive: ChatItem) => {
    const newValue = !chatToArchive.isArchived;
    setChats((prev) =>
      prev.map((c) => (c.id === chatToArchive.id ? { ...c, isArchived: newValue } : c)),
    );

    try {
      await api.patch(`/conversations/${chatToArchive.id}/archive`, { value: newValue });
    } catch {
      setChats((prev) =>
        prev.map((c) => (c.id === chatToArchive.id ? { ...c, isArchived: !newValue } : c)),
      );
    }
  };

  const handleMute = async (chatId: string, currentMuteStatus: boolean) => {
    const newValue = !currentMuteStatus;
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, isMuted: newValue } : c)));

    try {
      await api.patch(`/conversations/${chatId}/mute`, { value: newValue });
    } catch {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isMuted: currentMuteStatus } : c)),
      );
    }
  };

  const handleClearChat = async (chatToClear: ChatItem) => {
    const previousChats = [...chats];

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatToClear.id
          ? {
              ...c,
              lastMessage: 'No messages yet',
              time: undefined,
              unreadCount: 0,
            }
          : c,
      ),
    );

    try {
      await api.patch(`/conversations/${chatToClear.id}/clear`);
      setMenuOpen(false);
    } catch {
      setChats(previousChats);
    }
  };

  const handleDeleteChat = async (chatToDelete: ChatItem) => {
    const previousChats = [...chats];

    setChats((prev) => prev.filter((c) => c.id !== chatToDelete.id));

    try {
      await api.delete(`/conversations/${chatToDelete.id}`);
      setMenuOpen(false);
    } catch {
      setChats(previousChats);
    }
  };

  const renderChatItem = (chat: ChatItem) => (
    <article
      key={chat.id}
      onClick={() => handleOpenChat(chat)}
      onMouseDown={() => handleLongPressStart(chat)}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={() => handleLongPressStart(chat)}
      onTouchEnd={handleLongPressEnd}
      onContextMenu={handleContextMenu(chat)}
      className="flex items-center gap-3 py-2 border-b border-ebony-light select-none active:opacity-70 transition-opacity hover:cursor-pointer"
    >
      <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
        {chat.avatar_url ? (
          <img
            src={chat.avatar_url}
            alt={chat.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="font-bold text-[1.1rem] select-none text-platinum/85">
            {chat.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="w-full min-w-0 flex justify-between">
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold text-platinum/85 truncate">{chat.name}</h3>
          <p
            className={`font-medium text-xs truncate ${
              chat.lastMessage === 'No messages yet'
                ? 'text-platinum/40 italic'
                : chat.isMuted
                  ? 'text-platinum/40'
                  : 'text-platinum/70'
            }`}
          >
            {chat.lastMessage}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between gap-1 py-0.5 shrink-0">
          <time
            className={`text-[11px] select-none ${chat.unreadCount ? 'text-platinum/85 font-semibold' : 'text-platinum/50'}`}
          >
            {chat.time}
          </time>
          <div className="flex items-center gap-1">
            {chat.isPinned && !chat.unreadCount && <PinnedIcon />}

            {chat.isMuted && !chat.unreadCount && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-3 fill-platinum/40"
              >
                <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.4 479.7C530.6 477.3 543.9 462.4 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 99.2C249.4 107 215.8 128.8 192.8 158.9L73 39.1zM160 277.6C160 325.7 143.6 372.4 113.6 410L103.8 422.2C98.8 428.5 96 436.3 96 444.4C96 464 111.9 479.9 131.5 479.9L366.8 479.9L159.9 273L159.9 277.5zM320 576C349.8 576 374.9 555.6 382 528L258 528C265.1 555.6 290.2 576 320 576z" />
              </svg>
            )}

            {chat.unreadCount ? (
              <span className="flex justify-center items-center px-1.5 min-w-5 h-5 rounded-full bg-platinum/85 text-dark-charcoal text-[10px] font-bold">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <RootLayout>
      <MainLayout>
        <div className="flex flex-col gap-4 pt-2">
          <section className="flex flex-col gap-2 py-2">
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
                placeholder="Search chats..."
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
            <RecentStories />
          </section>
          <div className="flex-1 flex flex-col text-platinum/85 pb-20">
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
                  {displayChats.length > 0 ? (
                    displayChats.map(renderChatItem)
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
                        description={`No chats match "${searchQuery}"`}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : !hasAnyChat ? (
              <div className="mt-4">
                <EmptyState
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                      className="size-8 fill-current"
                    >
                      <path d="M64 96L64 512L192 512L192 608L352 512L576 512L576 96L64 96zM184 272L336 272L336 320L160 320L160 272L184 272zM408 272L480 272L480 320L384 320L384 272L408 272zM184 368L256 368L256 416L160 416L160 368L184 368zM328 368L480 368L480 416L304 416L304 368L328 368z" />
                    </svg>
                  }
                  title="No chats yet"
                  description="Start a conversation with your friends"
                />
              </div>
            ) : (
              <>
                {pinnedChats.length > 0 && (
                  <section aria-labelledby="pinned">
                    <h2
                      id="pinned"
                      className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                    >
                      PINNED
                    </h2>
                    {pinnedChats.map(renderChatItem)}
                  </section>
                )}
                <section aria-labelledby="all-chats" className="mt-3">
                  <h2
                    id="all-chats"
                    className="my-1 font-semibold text-xs text-platinum/70 tracking-wider select-none"
                  >
                    ALL CHATS
                  </h2>

                  {archivedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate('/chat/archived')}
                      className="flex items-center gap-3 py-3 mt-2 w-full hover:cursor-pointer active:opacity-70 transition-opacity"
                    >
                      <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                          className="size-6 fill-platinum/50"
                        >
                          <path d="M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z" />
                        </svg>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-platinum/60">Archived Chats</span>
                        <span className="text-xs text-platinum/35">
                          {archivedCount} archived conversations
                        </span>
                      </div>
                    </button>
                  )}
                  {unpinnedChats.map(renderChatItem)}
                </section>
              </>
            )}
          </div>
          <ChatFab onClick={() => setIsNewChatOpen(true)} />
          <NewChatSheet isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
          {selectedChat && (
            <ChatListMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              isGroup={false}
              isPinned={selectedChat.isPinned}
              isArchived={selectedChat.isArchived}
              isMuted={selectedChat.isMuted}
              conversationName={selectedChat.name}
              onPin={() => handlePin(selectedChat.id, selectedChat.isPinned)}
              onArchive={() => handleArchive(selectedChat)}
              onMute={() => handleMute(selectedChat.id, selectedChat.isMuted)}
              onClearChat={() => handleClearChat(selectedChat)}
              onDelete={() => handleDeleteChat(selectedChat)}
            />
          )}
        </div>
      </MainLayout>
    </RootLayout>
  );
}
