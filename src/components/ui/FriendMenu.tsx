import type { JSX } from 'react';
import BottomSheet from './BottomSheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  friend: {
    id: string;
    username: string;
    fullname: string | null;
  };
  onProfile: () => void;
  onUnfriend: () => void;
  onBlock: () => void;
};

export default function FriendMenu({
  isOpen,
  onClose,
  friend,
  onProfile,
  onUnfriend,
  onBlock,
}: Props): JSX.Element {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={friend.fullname ?? friend.username}>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            onProfile();
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
              <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">View Profile</span>
            <span className="text-xs text-platinum/50">See their full profile</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            onUnfriend();
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
              <path d="M285.7 368C384.2 368 464 447.8 464 546.3C464 562.7 450.7 576 434.3 576L77.7 576C61.3 576 48 562.7 48 546.3C48 447.8 127.8 368 226.3 368L285.7 368zM256 312C189.7 312 136 258.3 136 192C136 125.7 189.7 72 256 72C322.3 72 376 125.7 376 192C376 258.3 322.3 312 256 312zM600 216C613.3 216 624 226.7 624 240C624 253.3 613.3 264 600 264L456 264C442.7 264 432 253.3 432 240C432 226.7 442.7 216 456 216L600 216z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-platinum/85 leading-tight">Unfriend</span>
            <span className="text-xs text-platinum/50">Remove from your friend list</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            onBlock();
            onClose();
          }}
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
