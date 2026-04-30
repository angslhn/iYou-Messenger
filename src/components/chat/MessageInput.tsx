import { useState, useRef, useEffect } from 'react';

import ws from '../../lib/ws';
import ReplyPreview from './ReplyPreview';

import type { JSX, ChangeEvent, KeyboardEvent } from 'react';

type ReplyTo = {
  id: string;
  senderName: string;
  content: string;
};

export type EditMessagePayload = {
  id: string;
  content: string;
};

type Props = {
  onSend: (message: string, replyToId?: string) => void;
  replyTo?: ReplyTo | null;
  onCancelReply?: () => void;

  onEdit?: (messageId: string, content: string) => void;
  editMessage?: EditMessagePayload | null;
  onCancelEdit?: () => void;

  conversationId?: string;
  receiverId?: string;
};

export default function MessageInput({
  onSend,
  replyTo,
  onCancelReply,
  onEdit,
  editMessage,
  onCancelEdit,
  conversationId,
  receiverId,
}: Props): JSX.Element {
  const [message, setMessage] = useState<string>('');

  const isTypingRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Untuk mengisi teks otomatis saat tombol edit ditekan
  useEffect(() => {
    // UX: Fokuskan kursor dan sesuaikan tinggi textarea
    setTimeout(() => {
      if (editMessage) {
        setMessage(editMessage.content);

        if (textareaRef.current) {
          textareaRef.current.focus();
          // Taruh kursor di akhir teks
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      } else {
        // Kosongkan input jika edit dibatalkan
        setMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    }, 0);
  }, [editMessage]);

  const stopTyping = () => {
    if (isTypingRef.current && conversationId) {
      isTypingRef.current = false;
      ws.send('typing:stop', {
        conversationId,
        receiverId: receiverId || undefined,
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (!conversationId) return;

    if (!isTypingRef.current && e.target.value.trim() !== '') {
      isTypingRef.current = true;
      ws.send('typing:start', { conversationId, receiverId });
    }

    if (e.target.value.trim() === '') {
      stopTyping();
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    stopTyping();

    if (editMessage && onEdit && onCancelEdit) {
      // Jika mode edit aktif dan teks benar-benar berubah
      if (message.trim() !== editMessage.content) {
        onEdit(editMessage.id, message.trim());
      }
      onCancelEdit();
    } else {
      // Mode kirim normal
      onSend(message.trim(), replyTo?.id);
    }

    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col border-t border-ebony-light bg-dark-charcoal">
      {editMessage && onCancelEdit && (
        <div className="flex items-center justify-between px-4 py-2 bg-dark-deep border-b border-ebony-light">
          <div className="flex items-center gap-2 text-platinum/85 text-xs font-medium">
            <svg viewBox="0 0 24 24" className="size-4 fill-sky-400">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Edit Message
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 hover:cursor-pointer active:scale-95 text-platinum/40 hover:text-platinum/85 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}

      {replyTo && onCancelReply && !editMessage && (
        <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={editMessage ? 'Edit your message...' : 'Message...'}
          className="flex-1 resize-none outline-none bg-dark-deep border border-ebony-light rounded-2xl px-3 py-2.5 text-sm text-platinum/85 placeholder:text-platinum/40 max-h-28 [scrollbar-width:none]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || !!(editMessage && message.trim() === editMessage.content)}
          className="size-9 shrink-0 flex items-center justify-center rounded-full bg-platinum/85 text-dark-charcoal disabled:opacity-40 hover:cursor-pointer transition-colors"
        >
          {editMessage ? (
            <svg viewBox="0 0 24 24" className="size-5 fill-dark-charcoal">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4 fill-dark-charcoal">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
