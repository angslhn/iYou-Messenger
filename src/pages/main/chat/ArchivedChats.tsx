import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../lib/axios';
import initialName from '../../../helpers/initial-name';

import { useChatStore } from '../../../stores/useChatStore';

import SectionLayout from '../../../components/layouts/SectionLayout';
import ArrowLeftIcon from '../../../components/icons/ArrowLeftIcon';
import ChatListMenu from '../../../components/ui/ChatListMenu';
import EmptyState from '../../../components/ui/EmptyState';
import PinnedIcon from '../../../components/icons/PinnedIcon';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import type { JSX, MouseEvent } from 'react';
import type { ConversationResponse } from '../../../@types/globals';
import type { ChatItem } from './Chat';

export default function ArchivedChats(): JSX.Element {
  const navigate = useNavigate();
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [archivedChats, setArchivedChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    const fetchArchivedChats = async () => {
      setIsLoading(true);
      try {
        const {
          data: { conversations },
        } = await api.get<ConversationResponse>('/conversations/private/archive');

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

        setArchivedChats(formattedChats);
      } catch {
        /** empty */
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedChats();
  }, []);

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

  const handleContextMenu = (chat: ChatItem) => (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSelectedChat(chat);
    setMenuOpen(true);
  };

  const handleUnarchive = async (chatToUnarchive: ChatItem) => {
    const previousChats = [...archivedChats];

    setArchivedChats((prev) => prev.filter((c) => c.id !== chatToUnarchive.id));
    setMenuOpen(false);

    try {
      await api.patch(`/conversations/${chatToUnarchive.id}/archive`, { value: false });
    } catch {
      setArchivedChats(previousChats);
    }
  };

  const handlePin = async (chatId: string, currentPinStatus: boolean) => {
    const newValue = !currentPinStatus;
    setArchivedChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: newValue } : c)),
    );
    try {
      await api.patch(`/conversations/${chatId}/pin`, { value: newValue });
    } catch {
      setArchivedChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isPinned: currentPinStatus } : c)),
      );
    }
  };

  const handleMute = async (chatId: string, currentMuteStatus: boolean) => {
    const newValue = !currentMuteStatus;
    setArchivedChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isMuted: newValue } : c)),
    );
    try {
      await api.patch(`/conversations/${chatId}/mute`, { value: newValue });
    } catch {
      setArchivedChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, isMuted: currentMuteStatus } : c)),
      );
    }
  };

  const handleClearChat = async (chatToClear: ChatItem) => {
    const previousChats = [...archivedChats];

    setArchivedChats((prev) =>
      prev.map((c) =>
        c.id === chatToClear.id ? { ...c, lastMessage: 'No messages yet', time: undefined } : c,
      ),
    );
    setMenuOpen(false);

    try {
      await api.patch(`/conversations/${chatToClear.id}/clear`);
    } catch {
      setArchivedChats(previousChats);
    }
  };

  const handleDeleteChat = async (chatToDelete: ChatItem) => {
    const previousChats = [...archivedChats];
    setArchivedChats((prev) => prev.filter((c) => c.id !== chatToDelete.id));
    setMenuOpen(false);

    try {
      await api.delete(`/conversations/${chatToDelete.id}`);
    } catch {
      setArchivedChats(previousChats);
    }
  };

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-5 border-b border-ebony-light shrink-0">
        <button type="button" onClick={() => navigate('/chat')} className="hover:cursor-pointer">
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-xl text-platinum/85">Archived Chats</h1>
      </nav>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-4">
        {isLoading ? (
          <div className="flex flex-col mt-4">
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
          </div>
        ) : archivedChats.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-8 fill-current"
                >
                  <path d="M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z" />
                </svg>
              }
              title="No archived chats"
              description="Archived conversations will appear here"
            />
          </div>
        ) : (
          <div className="flex flex-col text-platinum/85 mt-2">
            {archivedChats
              .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
              .map((chat) => (
                <article
                  key={chat.id}
                  className="flex items-center gap-3 py-2 border-b border-ebony-light hover:cursor-pointer active:opacity-70 transition-opacity"
                  onClick={() => handleOpenChat(chat)}
                  onContextMenu={handleContextMenu(chat)}
                >
                  <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                    {chat.avatar_url ? (
                      <img
                        src={chat.avatar_url}
                        alt={chat.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-semibold text-3xl select-none">
                        {initialName(chat.name)}
                      </span>
                    )}
                  </div>
                  <div className="w-full min-w-0 flex justify-between">
                    <div className="flex flex-col overflow-hidden">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
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
                      <time className="text-xs text-platinum/70 select-none">{chat.time}</time>
                      <div className="flex items-center gap-1">
                        {chat.isPinned && <PinnedIcon />}
                        {chat.isMuted && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            className="size-3.5 fill-platinum/40"
                          >
                            <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.4 479.7C530.6 477.3 543.9 462.4 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 99.2C249.4 107 215.8 128.8 192.8 158.9L73 39.1zM160 277.6C160 325.7 143.6 372.4 113.6 410L103.8 422.2C98.8 428.5 96 436.3 96 444.4C96 464 111.9 479.9 131.5 479.9L366.8 479.9L159.9 273L159.9 277.5zM320 576C349.8 576 374.9 555.6 382 528L258 528C265.1 555.6 290.2 576 320 576z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </div>
      {selectedChat && (
        <ChatListMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          isGroup={false}
          isPinned={selectedChat.isPinned}
          isMuted={selectedChat.isMuted}
          isArchived={true}
          conversationName={selectedChat.name}
          onPin={() => handlePin(selectedChat.id, selectedChat.isPinned)}
          onMute={() => handleMute(selectedChat.id, selectedChat.isMuted)}
          onArchive={() => handleUnarchive(selectedChat)}
          onClearChat={() => handleClearChat(selectedChat)}
          onDelete={() => handleDeleteChat(selectedChat)}
        />
      )}
    </SectionLayout>
  );
}
