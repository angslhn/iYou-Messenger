import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ws from '../../../lib/ws';

import { useChatStore } from '../../../stores/useChatStore';

import MessageList from '../../../components/chat/MessageList';
import MessageInput from '../../../components/chat/MessageInput';
import EmptyState from '../../../components/ui/EmptyState';
import SkeletonItem from '../../../components/ui/SkeletonItem';
import ArrowLeftIcon from '../../../components/icons/ArrowLeftIcon';

import GroupRoomMenu from '../../../components/ui/GroupRoomMenu';
import MessageInfoSheet from '../../../components/ui/MessageInfoSheet';

import SectionLayout from '../../../components/layouts/SectionLayout';

import type { JSX } from 'react';
import type { MessageWithSender } from '../../../components/chat/MessageList';
import initialName from '../../../helpers/initial-name';

export default function GroupRoom(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    senderName: string;
    content: string;
  } | null>(null);

  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const navigate = useNavigate();

  const activeChat = useChatStore((state) => state.activeChat);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const typingStatus = useChatStore((state) => state.typingStatus);
  const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const isFetchingMessages = useChatStore((state) => state.isFetchingMessages);

  // Tarik data dari store
  const participantsByChat = useChatStore((state) => state.participantsByChat);
  const fetchParticipants = useChatStore((state) => state.fetchParticipants);

  useEffect(() => {
    if (activeChat?.id) {
      fetchMessages(activeChat.id);
      fetchParticipants(activeChat.id);
    }
  }, [activeChat?.id, fetchMessages, fetchParticipants]);

  const rawMessages = activeChat ? messagesByChat[activeChat.id] || [] : [];

  // Ambil daftar member grup saat ini
  const participants = activeChat ? participantsByChat[activeChat.id] || [] : [];

  const hydratedMessages: MessageWithSender[] = rawMessages.map((msg) => {
    // Cari data pengirim di buku absen
    const senderInfo = participants.find((p) => p.user_id === msg.sender_id);

    return {
      ...msg,
      senderName: senderInfo ? senderInfo.fullname || senderInfo.username : 'Member',
      senderAvatar: senderInfo?.avatar_url || null,
    };
  });

  useEffect(() => {
    if (activeChat?.id && rawMessages.length > 0) {
      markMessagesAsRead(activeChat.id);
    }
  }, [activeChat?.id, rawMessages.length, markMessagesAsRead]);

  const currentTypingUsers = activeChat ? typingStatus[activeChat.id] || [] : [];
  const isTyping = currentTypingUsers.length > 0;

  let typingText = '';

  if (currentTypingUsers.length === 1) typingText = 'One member is typing..';
  else if (currentTypingUsers.length > 1) typingText = 'Some members are typing...';

  const isAdmin = activeChat?.role === 'admin';

  const selectedMessage = rawMessages.find((m) => m.id === selectedMessageId);

  const messageReads =
    selectedMessage?.reads?.map((r) => {
      const readerInfo = participants.find((p) => p.user_id === r.user_id);

      return {
        id: r.user_id,
        username: readerInfo?.username || 'Member',
        fullname: readerInfo?.fullname || readerInfo?.username || 'Member',
        avatar_url: readerInfo?.avatar_url || null,
        readAt: new Date(r.read_at),
      };
    }) || [];

  const handleBack = () => navigate('/group');

  const handleInfo = (id: string) => {
    setSelectedMessageId(id);
    setInfoSheetOpen(true);
  };

  const handleSend = (message: string, replyToId?: string) => {
    if (!activeChat) return;

    ws.send('message:send', {
      conversationId: activeChat.id,
      content: message,
      replyToMessageId: replyToId || undefined,
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
            onClick={() => navigate('/group/profile')}
            className="flex items-center gap-3 hover:cursor-pointer active:opacity-70 transition-opacity text-left"
          >
            <div className="relative size-11 flex justify-center items-center rounded-xl bg-dark-deep border border-ebony-light overflow-hidden shrink-0">
              {activeChat?.avatar_url ? (
                <img
                  src={activeChat.avatar_url}
                  alt="group avatar"
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-semibold text-xl text-platinum/85 select-none">
                  {initialName(activeChat?.name ?? '')}
                </span>
              )}
            </div>

            <div className="flex flex-col items-baseline gap-0.5">
              <h1 className="font-bold text-sm text-platinum/85 leading-tight select-none line-clamp-1">
                {activeChat?.name || 'Loading...'}
              </h1>
              {isTyping ? (
                <span className="font-semibold text-[11px] text-sky-400 select-none animate-pulse">
                  {typingText}
                </span>
              ) : (
                <span className="font-semibold text-[11px] text-platinum/40 select-none">
                  Tap for group info
                </span>
              )}
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
        <SkeletonItem type="message-list" isGroup={true} />
      ) : hydratedMessages.length === 0 ? (
        <div className="flex-1 flex justify-center items-center">
          <EmptyState
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="size-8 fill-platinum/40"
              >
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,48,48,0,0,1,96,0Zm-16,0a32,32,0,1,0-32,32A32,32,0,0,0,160,88Zm16,88v16H80V176a40,40,0,0,1,40-40h16A40,40,0,0,1,176,176Zm-16,0a24,24,0,0,0-24-24H120a24,24,0,0,0-24,24v16h64Z" />
              </svg>
            }
            title="Belum ada pesan"
            description={`Jadilah yang pertama mengirim pesan di grup ${activeChat?.name}.`}
          />
        </div>
      ) : (
        <MessageList
          messages={hydratedMessages}
          isTyping={isTyping}
          isGroup={true}
          onInfo={handleInfo}
          onReply={(id, senderName, content) => setReplyTo({ id, senderName, content })}
        />
      )}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        conversationId={activeChat?.id}
      />
      <GroupRoomMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAdmin={isAdmin}
        onNavigateInfo={() => navigate('/group/profile')}
      />
      <MessageInfoSheet
        isOpen={infoSheetOpen}
        onClose={() => {
          setInfoSheetOpen(false);
          setSelectedMessageId(null);
        }}
        totalParticipants={participants.length}
        readBy={messageReads}
      />
    </SectionLayout>
  );
}
