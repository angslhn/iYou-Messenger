import initialName from '../../helpers/initial-name';
import BottomSheet from './BottomSheet';

import type { JSX } from 'react';

type ReadUser = {
  id: string;
  username: string;
  fullname: string | null;
  avatar_url: string | null;
  readAt: Date;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  totalParticipants: number;
  readBy: ReadUser[];
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export default function MessageInfoSheet({
  isOpen,
  onClose,
  totalParticipants,
  readBy = [],
}: Props): JSX.Element {
  const deliveredCount = totalParticipants - readBy.length - 1;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Message Info">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col items-center gap-1 py-3 bg-dark-deep border border-ebony-light rounded-2xl">
            <span className="font-black text-2xl text-platinum/85">{readBy.length}</span>
            <span className="text-xs font-semibold text-platinum/50">Read</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 py-3 bg-dark-deep border border-ebony-light rounded-2xl">
            <span className="font-black text-2xl text-platinum/85">
              {Math.max(0, deliveredCount)}
            </span>
            <span className="text-xs font-semibold text-platinum/50">Delivered</span>
          </div>
        </div>
        {readBy.length > 0 && (
          <div className="flex flex-col">
            <h3 className="font-semibold text-xs text-platinum/50 tracking-wider mb-2">
              READ BY ({readBy.length})
            </h3>
            {readBy.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2.5 border-b border-ebony-light last:border-0"
              >
                <div className="size-9 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
                  {user?.avatar_url ? (
                    <img
                      src={user?.avatar_url}
                      alt={`Avatar ${user.fullname ?? user.username}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-bold text-xl select-none text-platinum/85">
                      {initialName(user.fullname ?? user.username)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm text-platinum/85 truncate">
                    {user.fullname ?? user.username}
                  </span>
                  <span className="text-xs text-platinum/40">@{user.username}</span>
                </div>
                <span className="text-xs text-platinum/40 shrink-0">{formatTime(user.readAt)}</span>
              </div>
            ))}
          </div>
        )}
        {readBy.length === 0 && (
          <div className="flex flex-col items-center gap-1 py-4">
            <span className="text-platinum/40 text-sm">No one has read this yet</span>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
