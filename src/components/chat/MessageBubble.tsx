import { useState, useRef } from 'react';

import ws from '../../lib/ws';

import { useAuthStore } from '../../stores/useAuthStore';

import MessageMenu from '../ui/MessageMenu';
import EmojiPicker from '../ui/EmojiPicker';

import type { JSX } from 'react';

type Props = {
  id: string;
  isGroup?: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  createdAt: string;
  status?: 'sent' | 'delivered' | 'read';
  isSent: boolean;
  isEdited?: boolean;
  deletedAt?: string | null;
  replyToId?: string | null;
  replyToContent?: string;
  replyToSender?: string;
  reactions?: { id: string; user_id: string; reaction: string }[];
  onReply?: (id: string, senderName: string, content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onInfo?: (id: string) => void;
};

export default function MessageBubble({
  id,
  isGroup = false,
  content,
  createdAt,
  isSent,
  status = 'sent',
  senderName,
  senderAvatar,
  isEdited = false,
  deletedAt = null,
  replyToId,
  replyToContent,
  replyToSender,
  reactions = [],
  onReply,
  onEdit,
  onInfo,
}: Props): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const currentUserId = useAuthStore((state) => state.user?.id);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Format Waktu dari UTC (Database) ke Local Time (Browser)
  const timeString = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Grouping jumlah reaksi emoji yang sama
  const reactionCounts = reactions.reduce(
    (acc, curr) => {
      acc[curr.reaction] = (acc[curr.reaction] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (deletedAt) return; // Jangan buka menu jika pesan sudah dihapus

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTimer.current = setTimeout(() => {
      setMenuPos({ x: clientX, y: clientY });
      setMenuOpen(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCopy = () => {
    if (!deletedAt) navigator.clipboard.writeText(content);
  };

  const handleReact = () => {
    setMenuOpen(false);
    setEmojiPickerOpen(true);
  };

  const handleSelectEmoji = (emoji: string) => {
    const myExistingReaction = reactions.find((r) => r.user_id === currentUserId);

    const finalReaction = myExistingReaction?.reaction === emoji ? '' : emoji;

    ws.send('message:react', {
      messageId: id,
      reaction: finalReaction,
    });

    setEmojiPickerOpen(false);
  };

  const handleDelete = () => {
    ws.send('message:delete', {
      messageId: id,
    });

    setMenuOpen(false);
  };

  const handleCloseAll = () => {
    setMenuOpen(false);
    setEmojiPickerOpen(false);
  };

  return (
    <>
      <div
        className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {!isSent && isGroup && (
          <div className="size-8 shrink-0 rounded-full bg-dark-deep border border-ebony-light flex justify-center items-center overflow-hidden mb-1 select-none">
            {senderAvatar ? (
              <img
                src={senderAvatar}
                alt={senderName || 'Member'}
                className="size-full object-cover"
                draggable={false}
              />
            ) : (
              <span className="font-bold text-[11px] text-platinum/85 uppercase">
                {(senderName || 'M').charAt(0)}
              </span>
            )}
          </div>
        )}
        <div className="relative max-w-[75%]">
          <div
            className={`flex flex-col px-3 py-2 rounded-2xl text-sm leading-relaxed select-none
              ${
                isSent
                  ? 'bg-dark-deep border border-ebony-light rounded-br-sm text-platinum/85'
                  : 'bg-[#171717] border border-ebony-light rounded-bl-sm text-platinum/85'
              }
              ${deletedAt ? 'italic text-platinum/40 bg-transparent border-dashed' : ''} 
            `}
          >
            {!deletedAt && replyToId && replyToContent && (
              <div
                className={`flex gap-1.5 mb-1.5 pb-1.5 border-b ${
                  isSent ? 'border-platinum/10' : 'border-platinum/10'
                }`}
              >
                <div className="w-0.5 rounded-full bg-platinum/40 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-platinum/60 truncate">
                    {replyToSender || 'Someone'}
                  </span>
                  <span className="text-[10px] text-platinum/40 truncate">{replyToContent}</span>
                </div>
              </div>
            )}
            {!isSent && isGroup && senderName && !deletedAt && (
              <span className="text-xs font-bold text-platinum/60 mb-1">{senderName}</span>
            )}
            <p>
              {deletedAt ? (
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="size-4 fill-platinum/40">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
                  </svg>
                  This message has been deleted
                </span>
              ) : (
                content
              )}
            </p>
            <div
              className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              <time className="text-[10px] text-platinum/50 select-none">
                {timeString} {isEdited && !deletedAt && '(diedit)'}
              </time>
              {isSent && !deletedAt && (
                <div className="ml-0.5 flex items-center">
                  {status === 'sent' && (
                    <svg viewBox="0 0 24 24" className="size-3.5 fill-platinum/50">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                  {status === 'delivered' && (
                    <svg viewBox="0 0 24 24" className="size-3.5 fill-platinum/50">
                      <path d="M18 7l-1.41-1.41-6.34 6.36 1.42 1.42L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                    </svg>
                  )}
                  {status === 'read' && (
                    <svg viewBox="0 0 24 24" className="size-3.5 fill-sky-400">
                      <path d="M18 7l-1.41-1.41-6.34 6.36 1.42 1.42L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
          {!deletedAt && reactions.length > 0 && (
            <div
              className={`absolute -bottom-3 flex flex-wrap gap-1 z-10 
              ${isSent ? 'right-1' : 'left-1'}`}
            >
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <div
                  key={emoji}
                  className="flex items-center gap-1 bg-dark-charcoal border border-ebony-light rounded-full px-1.5 py-0.5 shadow-sm cursor-pointer hover:bg-ebony transition-colors"
                  onClick={() => handleSelectEmoji(emoji)}
                >
                  <span className="text-[11px] leading-none">{emoji}</span>
                  {count > 1 && (
                    <span className="text-[9px] font-bold text-platinum/70 leading-none">
                      {count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {!deletedAt && (
        <>
          <MessageMenu
            isOpen={menuOpen}
            isSent={isSent}
            isGroup={isGroup}
            position={menuPos}
            onClose={() => setMenuOpen(false)}
            onCopy={handleCopy}
            onReact={handleReact}
            onReply={() => onReply && onReply(id, senderName || 'You', content)}
            onEdit={isSent && !deletedAt ? () => onEdit && onEdit(id, content) : undefined}
            onDelete={isSent ? handleDelete : undefined}
            onInfo={isSent && isGroup ? () => onInfo && onInfo(id) : undefined}
          />
          <EmojiPicker
            isOpen={emojiPickerOpen}
            isSent={isSent}
            position={menuPos}
            onSelect={handleSelectEmoji}
            onClose={handleCloseAll}
          />
        </>
      )}
    </>
  );
}
