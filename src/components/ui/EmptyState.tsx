import type { JSX, ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function EmptyState({ icon, title, description }: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-8">
      <div className="size-16 flex justify-center items-center rounded-3xl bg-dark-deep border border-ebony-light text-3xl">
        {icon}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-bold text-platinum/60 text-base">{title}</span>
        <span className="text-sm text-platinum/35 leading-relaxed">{description}</span>
      </div>
    </div>
  );
}
