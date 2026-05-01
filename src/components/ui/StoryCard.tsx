import initialName from '../../helpers/initial-name';

import type { JSX } from 'react';

type Props = {
  data: {
    avatar: string | null;
    name: string;
    time: string;
    thumbnail: string | null;
    count: number;
    isSeen?: boolean;
  };
};

export default function StoryCard({ data }: Props): JSX.Element {
  const { name, time, avatar, thumbnail, count, isSeen = false } = data;

  return (
    <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-dark-deep border border-ebony-light group">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={`${name}'s story`}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-ebony to-dark-charcoal" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
      <div
        className={`absolute top-3 left-3 z-10 size-10 rounded-full border-2 shadow-lg overflow-hidden flex justify-center items-center bg-dark-charcoal font-bold text-platinum select-none transition-colors
        ${isSeen ? 'border-platinum/30 opacity-70' : 'border-platinum'}`}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="size-full object-cover" />
        ) : (
          <span className="font-bold text-xl select-none text-platinum/85">
            {initialName(name)}
          </span>
        )}
      </div>
      {count > 1 && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-platinum/20 backdrop-blur-md border border-platinum/30 text-[10px] font-bold text-platinum">
          {count}
        </div>
      )}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col gap-0">
        <span
          className={`font-bold text-sm select-none truncate drop-shadow-md ${isSeen ? 'text-platinum/70' : 'text-platinum'}`}
        >
          {name}
        </span>
        <span className="text-[10px] text-platinum/80 font-medium select-none drop-shadow-md">
          {time}
        </span>
      </div>
    </div>
  );
}
