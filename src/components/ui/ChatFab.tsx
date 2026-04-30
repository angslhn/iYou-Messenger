import type { JSX } from 'react';

type Props = {
  onClick: () => void;
};

export default function ChatFab({ onClick }: Props): JSX.Element {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-18 xs:max-w-90 s:max-w-97.5 s-medium:max-w-112.5 max-w-md z-20 pointer-events-none">
      <div className="absolute bottom-24 right-7 flex flex-col items-end gap-4 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={onClick}
          className="active:scale-95 rounded-2xl flex justify-center items-center transition-all z-40 cursor-pointer"
          aria-label="New chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="fill-platinum/85 size-10"
          >
            <path d="M32 32L416 32L416 368L240 368L128 448L128 368L32 368L32 32zM224 528L224 438.4L255.4 416L464 416L464 192L608 192L608 528L512 528L512 608L400 528L224 528z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
