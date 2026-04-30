import BottomSheet from './BottomSheet';

import type { JSX } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isGroup?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  conversationName?: string;
  onPin: () => void;
  onArchive: () => void;
  onMute: () => void;
  onClearChat: () => void;
  onDelete?: () => void;
};

export default function ChatListMenu({
  isOpen,
  onClose,
  isGroup = false,
  isPinned = false,
  isArchived = false,
  isMuted = false,
  conversationName,
  onPin,
  onArchive,
  onMute,
  onClearChat,
  onDelete,
}: Props): JSX.Element {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={conversationName ?? (isGroup ? 'Group Options' : 'Chat Options')}
    >
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            onPin();
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
              <path d="M235.33,104l-53.47,53.65c4.56,12.67,6.45,33.89-13.19,60A15.93,15.93,0,0,1,157,224c-.38,0-.75,0-1.13,0a16,16,0,0,1-11.32-4.69L96.29,171,53.66,213.66a8,8,0,0,1-11.32-11.32L85,159.71l-48.3-48.3A16,16,0,0,1,38,87.63c25.42-20.51,49.75-16.48,60.4-13.14L152,20.7a16,16,0,0,1,22.63,0l60.69,60.68A16,16,0,0,1,235.33,104Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">
              {isPinned ? 'Unpin' : 'Pin'}
            </span>
            <span className="text-xs text-platinum/50">
              {isPinned ? 'Remove from pinned' : 'Keep on top of list'}
            </span>
          </div>
          {isPinned && (
            <span className="text-xs font-semibold text-platinum/40 shrink-0">Pinned</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            onArchive();
            onClose();
          }}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 fill-platinum/70"
            >
              <path d="M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">
              {isArchived ? 'Unarchive' : 'Archive'}
            </span>
            <span className="text-xs text-platinum/50">
              {isArchived ? 'Return to main list' : 'Hide from main list'}
            </span>
          </div>
          {isArchived && (
            <span className="text-xs font-semibold text-platinum/40 shrink-0">Archived</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            onMute();
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
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56Zm0,40a8,8,0,1,1,8,8A8,8,0,0,1,120,176Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
            <span className="text-xs text-platinum/50">
              {isMuted ? 'Turn notifications back on' : 'Silence notifications'}
            </span>
          </div>
          {isMuted && (
            <span className="text-xs font-semibold text-platinum/40 shrink-0">Muted</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            onClearChat();
            onClose();
          }}
          className={`flex items-center gap-4 px-1 py-3.5 active:opacity-70 transition-opacity hover:cursor-pointer ${!isGroup ? 'border-b border-ebony-light' : ''}`}
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-5 fill-platinum/70"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Clear Chat</span>
            <span className="text-xs text-platinum/50">Remove all messages for you</span>
          </div>
        </button>
        {!isGroup && onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center gap-4 px-1 py-3.5 active:opacity-70 transition-opacity hover:cursor-pointer"
          >
            <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="size-5 fill-red-600/70"
              >
                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
              </svg>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-red-600/85 leading-tight">Delete Chat</span>
              <span className="text-xs text-red-600/50">Remove this conversation</span>
            </div>
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
