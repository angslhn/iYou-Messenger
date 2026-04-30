import { useLocation } from 'react-router-dom';

import type { JSX } from 'react';

const title: Record<string, string> = {
  chat: 'iYou',
  group: 'Groups',
  story: 'Stories',
  friend: 'Friends',
  account: 'Account',
};

export default function Header(): JSX.Element {
  const { pathname } = useLocation();

  const path = pathname.substring(1);

  const isChat = path === 'chat';

  return (
    <header className={`mx-4 transition-all duration-200 ${isChat ? 'mb-0 mt-1' : 'my-2'}`}>
      <h1
        className={`font-bold text-platinum/85 select-none transition-all ${
          isChat ? 'text-[29px]' : 'text-[25px]'
        }`}
      >
        {title[path] || 'iYou'}
      </h1>
    </header>
  );
}
