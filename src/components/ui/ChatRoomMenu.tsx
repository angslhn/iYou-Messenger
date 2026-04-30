import { useNavigate } from 'react-router-dom';

import api from '../../lib/axios';

import { useChatStore } from '../../stores/useChatStore';

import BottomSheet from './BottomSheet';

import type { JSX } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isPinned?: boolean;
  isMuted?: boolean;
};

export default function ChatRoomMenu({
  isOpen,
  onClose,
  isPinned = false,
  isMuted = false,
}: Props): JSX.Element {
  const navigate = useNavigate();

  const activeChat = useChatStore((state) => state.activeChat);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const handlePin = async () => {
    if (!activeChat) return;

    const newValue = !isPinned;

    setActiveChat({ ...activeChat, is_pinned: newValue });

    try {
      await api.patch(`/conversations/${activeChat.id}/pin`, { value: newValue });
    } catch {
      setActiveChat({ ...activeChat, is_pinned: isPinned });
    }
  };

  const handleMute = async () => {
    if (!activeChat) return;

    const newValue = !isMuted;

    setActiveChat({ ...activeChat, is_muted: newValue });

    try {
      await api.patch(`/conversations/${activeChat.id}/mute`, { value: newValue });
    } catch {
      setActiveChat({ ...activeChat, is_muted: isMuted });
    }
  };

  const handleClearChat = async () => {
    if (!activeChat) return;

    onClose();

    try {
      await api.patch(`/conversations/${activeChat.id}/clear`);
      useChatStore.getState().setMessages(activeChat.id, []);
    } catch {
      console.error('Failed to clear chat');
    }
  };

  const handleBlock = async () => {
    if (!activeChat || !activeChat.target_user_id) return;

    onClose();

    try {
      await api.patch(`/friendships/block/${activeChat.target_user_id}`);
      navigate('/chat');
    } catch {
      console.error('Failed to block user');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Chat Options">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handlePin}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-[0.9rem] fill-platinum/70"
            >
              <path d="M235.33,104l-53.47,53.65c4.56,12.67,6.45,33.89-13.19,60A15.93,15.93,0,0,1,157,224c-.38,0-.75,0-1.13,0a16,16,0,0,1-11.32-4.69L96.29,171,53.66,213.66a8,8,0,0,1-11.32-11.32L85,159.71l-48.3-48.3A16,16,0,0,1,38,87.63c25.42-20.51,49.75-16.48,60.4-13.14L152,20.7a16,16,0,0,1,22.63,0l60.69,60.68A16,16,0,0,1,235.33,104Z"></path>
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">
              {isPinned ? 'Unpin Chat' : 'Pin Chat'}
            </span>
            <span className="text-xs text-platinum/50">
              {isPinned ? 'Remove from pinned' : 'Keep this chat on top'}
            </span>
          </div>
          {isPinned && (
            <span className="text-xs font-semibold text-platinum/40 shrink-0">Pinned</span>
          )}
        </button>
        <button
          type="button"
          onClick={handleMute}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-4 fill-platinum/70"
              >
                <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.4 479.7C530.6 477.3 543.9 462.4 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 99.2C249.4 107 215.8 128.8 192.8 158.9L73 39.1zM160 277.6C160 325.7 143.6 372.4 113.6 410L103.8 422.2C98.8 428.5 96 436.3 96 444.4C96 464 111.9 479.9 131.5 479.9L366.8 479.9L159.9 273L159.9 277.5zM320 576C349.8 576 374.9 555.6 382 528L258 528C265.1 555.6 290.2 576 320 576z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-4 fill-platinum/70"
              >
                <path d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">
              {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
            </span>
            <span className="text-xs text-platinum/50">
              {isMuted ? 'Turn notifications back on' : 'Silence this conversation'}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={handleClearChat}
          className="flex items-center gap-4 px-1 py-3.5 border-b border-ebony-light active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-dark-deep border border-ebony-light rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-4 fill-platinum/70"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Clear Chat</span>
            <span className="text-xs text-platinum/50">Remove all messages for you</span>
          </div>
        </button>
        <button
          type="button"
          onClick={handleBlock}
          className="flex items-center gap-4 px-1 py-3.5 active:opacity-70 transition-opacity hover:cursor-pointer"
        >
          <div className="size-10 shrink-0 flex justify-center items-center bg-red-600/10 border border-red-600/30 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-5 fill-red-600/70"
            >
              <path d="M431.2 476.5L163.5 208.8C141.1 240.2 128 278.6 128 320C128 426 214 512 320 512C361.5 512 399.9 498.9 431.2 476.5zM476.5 431.2C498.9 399.8 512 361.4 512 320C512 214 426 128 320 128C278.5 128 240.1 141.1 208.8 163.5L476.5 431.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-red-600/85 leading-tight">Block User</span>
            <span className="text-xs text-red-600/50">Prevent messages from this user</span>
          </div>
        </button>
      </div>
    </BottomSheet>
  );
}
