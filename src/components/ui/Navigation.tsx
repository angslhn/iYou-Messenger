import { NavLink } from 'react-router-dom';

import { useSocialStore } from '../../stores/useSocialStore';

import ChatIcon from '../icons/ChatIcon';
import GroupIcon from '../icons/GroupIcon';
import StoryIcon from '../icons/StoryIcon';
import FriendIcon from '../icons/FriendIcon';
import AccountIcon from '../icons/AccountIcon';

import type { JSX } from 'react';

const navItems: {
  to: string;
  label: string;
  icon: JSX.Element;
  badge?: boolean;
}[] = [
  { to: '/chat', label: 'Chats', icon: <ChatIcon /> },
  { to: '/group', label: 'Groups', icon: <GroupIcon />, badge: true },
  { to: '/story', label: 'Stories', icon: <StoryIcon /> },
  { to: '/friend', label: 'Friends', icon: <FriendIcon />, badge: true },
  { to: '/account', label: 'Account', icon: <AccountIcon /> },
];

export default function Navigation(): JSX.Element {
  const { pendingRequests, pendingInvites } = useSocialStore();

  const BadgeCircle = (value: number) => (
    <div className="absolute top-0.5 right-0.5 min-w-5 h-5 flex justify-center items-center rounded-full bg-platinum/75 px-1">
      <span className="text-[9px] font-black text-dark-charcoal leading-none">
        {value > 9 ? '9+' : value}
      </span>
    </div>
  );

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-18 xs:max-w-90 s:max-w-97.5 s-medium:max-w-112.5 max-w-md z-20">
      <ul className="h-full flex justify-evenly items-center border-t border-ebony-light bg-dark-charcoal text-platinum/85">
        {navItems.map(({ to, label, icon, badge }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} draggable={false} className="relative block w-full">
              {({ isActive }) => (
                <div
                  className={`flex flex-col justify-center items-center gap-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-65'}`}
                >
                  <div className="relative size-10 flex justify-center items-center mb-1.5">
                    {icon}
                    {badge &&
                      pendingInvites > 0 &&
                      label === 'Groups' &&
                      BadgeCircle(pendingInvites)}
                    {badge &&
                      pendingRequests > 0 &&
                      label === 'Friends' &&
                      BadgeCircle(pendingRequests)}
                  </div>
                  <span className="absolute bottom-1.5 text-[0.7rem] font-semibold">{label}</span>
                  <div
                    className={`size-1 mt-2 ${isActive ? 'bg-platinum/85' : 'bg-transparent'} rounded-full`}
                  />
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
