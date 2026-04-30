import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props): JSX.Element {
  return (
    <main className="relative flex flex-col flex-1 overflow-y-auto pb-16 px-4">{children}</main>
  );
}
