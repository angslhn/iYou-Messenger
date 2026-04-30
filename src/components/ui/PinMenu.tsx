import BottomSheet from './BottomSheet';

import type { JSX } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  onCopy: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
};

export default function PinMenu({
  isOpen,
  onClose,
  pin,
  onCopy,
  onRegenerate,
  onDelete,
}: Props): JSX.Element {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="PIN Options">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center items-center py-4 mb-2 bg-dark-deep border border-ebony-light rounded-2xl">
          <span className="text-2xl font-bold tracking-[0.3em] text-platinum/85 select-all">
            {pin}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onCopy();
            onClose();
          }}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-5 fill-platinum/70"
            >
              <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Copy PIN</span>
            <span className="text-xs text-platinum/50">Copy to clipboard</span>
          </div>
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 fill-platinum/70"
            >
              <path d="M576 56L497 135C396.7 39 237.6 40.3 139 139C89 189 64 254.5 64 320L128 320C128 270.8 146.7 221.7 184.2 184.2C257.8 110.6 376.4 109.2 451.7 180.3L376 256L576 256L576 56zM188.3 459.7L264 384L64 384L64 584L143 505C243.3 601 402.4 599.7 501 501C551 451 576 385.4 576 320L512 320C512 369.2 493.3 418.3 455.8 455.8C382.2 529.4 263.6 530.8 188.3 459.7z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Regenerate PIN</span>
            <span className="text-xs text-platinum/50">
              Generate a new PIN, old one will expire
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-4 px-1 py-3.5 active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-5 fill-red-600/70"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-red-600/85 leading-tight">Delete PIN</span>
            <span className="text-xs text-red-600/50">Remove PIN from your account</span>
          </div>
        </button>
      </div>
    </BottomSheet>
  );
}
