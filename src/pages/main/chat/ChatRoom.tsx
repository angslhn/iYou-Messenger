import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ws from '../../../lib/ws';
import formatLastSeen from '../../../helpers/format-last-seen';

import { useChatStore } from '../../../stores/useChatStore';

import SectionLayout from '../../../components/layouts/SectionLayout';
import ChatRoomMenu from '../../../components/ui/ChatRoomMenu';
import MessageList from '../../../components/chat/MessageList';
import MessageInput from '../../../components/chat/MessageInput';
import EmptyState from '../../../components/ui/EmptyState';
import SkeletonItem from '../../../components/ui/SkeletonItem';
import ArrowLeftIcon from '../../../components/icons/ArrowLeftIcon';

import type { JSX } from 'react';
import type { MessageWithSender } from '../../../components/chat/MessageList';
import type { EditMessagePayload } from '../../../components/chat/MessageInput';

export default function ChatRoom(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [editMessage, setEditMessage] = useState<EditMessagePayload | null>(null);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    senderName: string;
    content: string;
  } | null>(null);

  const navigate = useNavigate();

  const activeChat = useChatStore((state) => state.activeChat);
  const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const isFetchingMessages = useChatStore((state) => state.isFetchingMessages);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const typingStatus = useChatStore((state) => state.typingStatus);

  const rawMessages = activeChat ? messagesByChat[activeChat.id] || [] : [];

  useEffect(() => {
    if (!activeChat?.id || activeChat.id === '') return;

    fetchMessages(activeChat.id);
  }, [activeChat?.id, fetchMessages]);

  useEffect(() => {
    if (activeChat?.id && activeChat.id !== '' && rawMessages.length > 0) {
      markMessagesAsRead(activeChat.id);
    }
  }, [activeChat?.id, rawMessages.length, markMessagesAsRead]);

  const hydratedMessages: MessageWithSender[] = rawMessages.map((msg) => ({
    ...msg,
    senderName: activeChat?.name || 'User',
  }));

  const currentTypingUsers = activeChat ? typingStatus[activeChat.id] || [] : [];
  const isTyping = currentTypingUsers.length > 0;

  const isOnline = activeChat?.target_user_id ? onlineUsers[activeChat.target_user_id] : false;

  const handleBack = () => {
    navigate('/chat');
  };

  const handleEdit = (messageId: string, content: string) => {
    ws.send('message:edit', {
      messageId,
      content,
    });
  };

  const handleSend = (message: string, replyToId?: string) => {
    if (!activeChat) return;

    let payload: { receiverId?: string; conversationId?: string };

    if (activeChat.id && activeChat.id !== '') {
      payload = { conversationId: activeChat.id };
    } else if (activeChat.type === 'private' && activeChat.target_user_id) {
      payload = { receiverId: activeChat.target_user_id };
    } else {
      payload = { conversationId: activeChat.id };
    }

    ws.send('message:send', {
      content: message,
      replyToMessageId: replyToId || undefined,
      ...payload,
    });

    setReplyTo(null);
  };

  return (
    <SectionLayout>
      <nav className="h-16 flex justify-between items-center gap-4 px-4 border-b border-ebony-light shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="hover:cursor-pointer">
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => navigate('/chat/profile')}
            className="flex items-center gap-3 hover:cursor-pointer active:opacity-70 transition-opacity text-left"
          >
            <div className="relative size-11 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light overflow-hidden shrink-0">
              {activeChat?.avatar_url ? (
                <img src={activeChat.avatar_url} alt="avatar" className="size-full object-cover" />
              ) : (
                <span className="font-semibold text-platinum/85 select-none">
                  {activeChat?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="flex flex-col items-baseline gap-0.5">
              <h1 className="font-bold text-sm text-platinum/85 leading-tight select-none line-clamp-1">
                {activeChat?.name || 'Loading...'}
              </h1>
              {isTyping ? (
                <span className="font-semibold text-[11px] text-sky-400 select-none animate-pulse">
                  Typing...
                </span>
              ) : isOnline ? (
                <span className="font-semibold text-[11px] text-green-400 select-none">Online</span>
              ) : activeChat?.last_seen ? (
                <span className="font-semibold text-[11px] text-platinum/40 select-none">
                  {formatLastSeen(activeChat?.last_seen)}
                </span>
              ) : null}
            </div>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="p-2 rounded-full bg-dark-deep border border-ebony-light hover:cursor-pointer active:scale-95 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className="size-3 fill-platinum/85"
          >
            <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM128,76a28,28,0,1,0-28-28A28,28,0,0,0,128,76Zm0,104a28,28,0,1,0,28,28A28,28,0,0,0,128,180Z" />
          </svg>
        </button>
      </nav>
      {isFetchingMessages ? (
        <SkeletonItem type="message-list" />
      ) : hydratedMessages.length === 0 ? (
        <div className="flex-1 flex justify-center items-center">
          <EmptyState
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-8 fill-platinum/85"
              >
                <path
                  fillRule="evenodd"
                  d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                  clipRule="evenodd"
                />
              </svg>
            }
            title="No messages here yet"
            description={`Say hi to ${activeChat?.name} and start the conversation.`}
          />
        </div>
      ) : (
        <MessageList
          messages={hydratedMessages}
          isTyping={isTyping}
          isGroup={false}
          onReply={(id, senderName, content) => setReplyTo({ id, senderName, content })}
          onEdit={(id, content) => setEditMessage({ id, content })}
        />
      )}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onEdit={handleEdit}
        editMessage={editMessage}
        onCancelEdit={() => setEditMessage(null)}
        conversationId={activeChat?.id}
        receiverId={activeChat?.target_user_id ?? undefined}
      />
      <ChatRoomMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isPinned={activeChat?.is_pinned || false}
        isMuted={activeChat?.is_muted || false}
      />
    </SectionLayout>
  );
}
