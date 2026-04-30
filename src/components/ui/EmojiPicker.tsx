import type { JSX } from 'react';

const EMOJIS = [
  '👍',
  '❤️',
  '😂',
  '😮',
  '😢',
  '😡',
  '🔥',
  '👏',
  '😍',
  '🤣',
  '😎',
  '🤔',
  '💯',
  '🎉',
  '😴',
  '🤮',
  '💀',
  '🙏',
  '☝️',
  '🗿',
  '😤',
];

type Props = {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
  isSent: boolean;
};

export default function EmojiPicker({
  isOpen,
  onSelect,
  onClose,
  position,
  isSent,
}: Props): JSX.Element {
  if (!isOpen) return <></>;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{
          position: 'fixed',
          top: Math.max(position.y - 70, 8),
          left: isSent
            ? Math.min(position.x - 160, window.innerWidth - 180)
            : Math.max(position.x - 8, 8),
          zIndex: 50,
        }}
        className="animate-fade-in"
      >
        <div className="flex items-center gap-1 px-2 py-2 bg-dark-charcoal border border-ebony-light rounded-2xl shadow-xl overflow-x-auto [scrollbar-width:none] max-w-42">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="size-9 shrink-0 flex justify-center items-center rounded-xl text-xl hover:bg-dark-deep active:scale-90 transition-all hover:cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div
          className={`w-3 h-3 bg-dark-charcoal border-r border-b border-ebony-light rotate-45 mx-3 -mt-1.5 ${isSent ? 'ml-auto mr-4' : 'ml-4'}`}
        />
      </div>
    </>
  );
}
