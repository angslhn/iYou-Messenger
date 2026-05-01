import initialName from '../../helpers/initial-name';

import type { JSX } from 'react';

type Story = {
  thumbnail: string;
  name: string;
  isSeen: boolean;
};

type Props = {
  data: Story;
};

export default function FriendStoryCircle({ data }: Props): JSX.Element {
  const { thumbnail, name, isSeen } = data;

  return (
    <div className="flex flex-col shrink-0 items-center gap-1.5 w-16 group">
      <div
        className={`size-16 shrink-0 flex justify-center items-center rounded-full overflow-hidden bg-dark-deep border-2 p-0.5 transition-all
        ${isSeen ? 'border-ebony-light opacity-60' : 'border-platinum/85'}`}
      >
        <div className="size-full rounded-full overflow-hidden bg-dark-deep">
          {thumbnail !== '' ? (
            <img
              src={thumbnail}
              alt={`Story by ${name}`}
              className="size-full object-cover select-none"
              draggable={false}
            />
          ) : (
            <span className="flex items-center justify-center h-full text-xl font-bold text-platinum/70 uppercase select-none">
              {initialName(name)}
            </span>
          )}
        </div>
      </div>
      <span
        className={`mt-0.5 text-[11px] select-none font-semibold text-center truncate w-full transition-colors 
        ${isSeen ? 'text-platinum/40' : 'text-platinum/85'}`}
      >
        {name.split(' ')[0]}
      </span>
    </div>
  );
}
