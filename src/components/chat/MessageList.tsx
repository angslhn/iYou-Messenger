import { useEffect, useRef } from 'react';

import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

import { useAuthStore } from '../../stores/useAuthStore';

import type { JSX } from 'react';
import type { Message } from '../../@types/globals';
import { useChatStore } from '../../stores/useChatStore';

export type MessageWithSender = Message & {
  senderName?: string;
  senderAvatar?: string | null;
};

type Props = {
  messages: MessageWithSender[];
  isTyping?: boolean;
  isGroup?: boolean;
  onReply?: (id: string, senderName: string, content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onInfo?: (id: string) => void;
};

export default function MessageList({
  messages,
  isTyping = false,
  isGroup = false,
  onReply,
  onEdit,
  onInfo,
}: Props): JSX.Element {
  const myUserId = useAuthStore((state) => state.user?.id);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { activeChat, onlineUsers } = useChatStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto px-4 py-4 [scrollbar-width:none]">
      {messages.map((msg) => {
        const isSent = msg.sender_id === myUserId;
        const isRead = msg.reads && msg.reads.some((r) => r.user_id !== myUserId);

        let status: 'sent' | 'delivered' | 'read';

        if (isRead) {
          status = 'read'; // 2 Centang biru
        } else if (
          !isGroup &&
          activeChat?.target_user_id &&
          onlineUsers[activeChat.target_user_id]
        ) {
          status = 'delivered'; // 2 Centang abu (Pseudo-Delivered karena user sedang online)
        } else {
          status = 'sent'; // 1 Centang abu
        }

        let replyToContent: string | undefined = undefined;
        let replyToSender: string | undefined = undefined;

        if (msg.reply_to_message_id) {
          const repliedMsg = messages.find((m) => m.id === msg.reply_to_message_id);

          if (repliedMsg) {
            replyToContent = repliedMsg.deleted_at
              ? 'This message has been deleted'
              : repliedMsg.content;

            replyToSender =
              repliedMsg.sender_id === myUserId ? 'You' : repliedMsg.senderName || 'Someone';
          } else {
            replyToContent = 'Old message...';
            replyToSender = 'Unknown';
          }
        }

        return (
          <MessageBubble
            key={msg.id}
            id={msg.id}
            content={msg.content}
            createdAt={msg.created_at}
            status={status}
            isSent={isSent}
            senderName={msg.senderName || 'Member'}
            senderAvatar={msg.senderAvatar}
            isEdited={msg.is_edited}
            reactions={msg.reactions}
            deletedAt={msg.deleted_at}
            replyToId={msg.reply_to_message_id}
            replyToContent={replyToContent}
            replyToSender={replyToSender}
            isGroup={isGroup}
            onReply={onReply}
            onEdit={onEdit}
            onInfo={onInfo}
          />
        );
      })}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} className="h-1 shrink-0" />
    </div>
  );
}
