import { useNavigate } from 'react-router-dom';

import type { JSX } from 'react';
import initialName from '../../helpers/initial-name';

type Props = {
  user: {
    id: string;
    username: string;
    fullname: string | null;
    avatar_url: string | null;
    about: string | null;
  };
  actionType: 'send_request' | 'add_by_pin';
  onAction: () => void;
};

export default function UserResultCard({ user, actionType, onAction }: Props): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-ebony-light">
      <button
        type="button"
        onClick={() => navigate(`/user/${user.id}`)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:cursor-pointer active:opacity-70 transition-opacity"
      >
        <div className="size-12 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
          {user?.avatar_url ? (
            <img
              src={user?.avatar_url}
              alt={`Avatar ${user?.fullname ?? user.username}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-bold text-xl select-none text-platinum/85">
              {initialName(user.fullname ?? user.username)}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          {user.fullname && (
            <span className="font-bold text-platinum/85 truncate leading-tight">
              {user.fullname}
            </span>
          )}
          <span className="text-sm text-platinum/50 truncate">@{user.username}</span>
          {user.about && (
            <span className="text-xs text-platinum/40 truncate mt-0.5 italic">{user.about}</span>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 px-3 py-1.5 rounded-xl bg-platinum/85 text-dark-charcoal font-semibold text-xs hover:cursor-pointer active:scale-95 transition-transform"
      >
        {actionType === 'add_by_pin' ? 'Add Friend' : 'Add'}
      </button>
    </div>
  );
}
