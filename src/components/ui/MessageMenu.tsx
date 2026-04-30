import { useEffect, useRef } from 'react';

import type { JSX } from 'react';

type Props = {
  isOpen: boolean;
  isSent: boolean;
  isGroup?: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCopy: () => void;
  onReact: () => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onInfo?: () => void;
};

export default function MessageMenu({
  isOpen,
  isSent,
  isGroup = false,
  position,
  onClose,
  onCopy,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onInfo,
}: Props): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return <></>;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: Math.min(position.y, window.innerHeight - 160),
          left: Math.min(Math.max(position.x, 8), window.innerWidth - 160),
          zIndex: 50,
        }}
        className="bg-dark-charcoal border border-ebony-light rounded-2xl shadow-xl overflow-hidden min-w-36 animate-fade-in"
      >
        {isGroup && onInfo && (
          <button
            type="button"
            onClick={() => {
              onInfo();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-ebony-light hover:bg-dark-deep active:opacity-70 transition-colors hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-4 fill-platinum/70"
            >
              <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM348 444L292 444L292 388L348 388L348 444zM339.2 352L300.8 352L288 192L352 192L339.2 352z" />
            </svg>
            <span className="font-semibold text-sm text-platinum/85">Info</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onCopy();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 border-b border-ebony-light hover:bg-dark-deep active:opacity-70 transition-colors hover:cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="size-4 fill-platinum/70"
          >
            <path d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z" />
          </svg>
          <span className="font-semibold text-sm text-platinum/85">Copy</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onReact();
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-deep active:opacity-70 transition-colors hover:cursor-pointer ${isSent && !onDelete ? '' : 'border-b border-ebony-light'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="size-4 fill-platinum/70"
          >
            <path d="M64 96L64 512L192 512L192 608L352 512L576 512L576 96L64 96zM313.6 247.5L320 256L326.4 247.5C337.5 232.7 354.9 224 373.3 224C405.7 224 432 250.3 432 282.7L432 288C432 352 320 416 320 416C320 416 208 352 208 288L208 282.7C208 250.3 234.3 224 266.7 224C285.2 224 302.6 232.7 313.6 247.5z" />
          </svg>
          <span className="font-semibold text-sm text-platinum/85">React</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onReply();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 border-b border-ebony-light hover:bg-dark-deep active:opacity-70 transition-colors hover:cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="size-4 fill-platinum/70"
          >
            <path d="M48.5 272L288.3 56.1L288.3 192L400.3 192C497.5 192 576.3 270.8 576.3 368C576.3 496 448.3 544 448.3 544C448.3 544 480.3 512 480.3 464C480.3 402.1 430.2 352 368.3 352L288.3 352L288.3 487.9L48.5 272z" />
          </svg>
          <span className="font-semibold text-sm text-platinum/85">Reply</span>
        </button>
        {isSent && onEdit && (
          <button
            type="button"
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-ebony-light hover:bg-dark-deep active:opacity-70 transition-colors hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-4 fill-platinum/70"
            >
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM192,108.68,147.31,64l24-24L216,84.68Z" />
            </svg>
            <span className="font-semibold text-sm text-platinum/85">Edit</span>
          </button>
        )}
        {isSent && onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 active:opacity-70 transition-colors hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-4 fill-red-500/70"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
            </svg>
            <span className="font-semibold text-sm text-red-500/85">Delete</span>
          </button>
        )}
      </div>
    </>
  );
}
