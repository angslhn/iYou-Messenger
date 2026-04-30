import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function SectionLayout({ children }: Props): JSX.Element {
  return (
    <main className="h-screen min-h-145 flex justify-center bg-night">
      <div className="flex flex-col size-full xs:max-w-90 s:max-w-97.5 s-medium:max-w-112.5">
        {children}
      </div>
    </main>
  );
}
