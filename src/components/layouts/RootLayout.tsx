import Header from '../ui/Header';
import Navigation from '../ui/Navigation';

import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props): JSX.Element {
  return (
    <div className="hidden xxs:flex h-screen min-h-145 justify-center bg-night">
      <div className="relative flex flex-col size-full xs:max-w-90 s:max-w-97.5">
        <Header />
        {children}
        <Navigation />
      </div>
    </div>
  );
}
