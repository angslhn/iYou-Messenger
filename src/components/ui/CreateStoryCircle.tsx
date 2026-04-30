import type { JSX } from 'react';

export default function CreateStoryCircle(): JSX.Element {
  return (
    <button
      type="button"
      className="group flex flex-col shrink-0 items-center gap-2 w-16 outline-none active:scale-95 transition-transform"
    >
      <div
        className="size-16 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border-2 border-dashed border-ebony-light 
                   group-hover:border-platinum/50 group-hover:bg-ebony-light/10 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="size-5 fill-platinum/85 group-hover:scale-110 transition-transform"
        >
          <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"></path>
        </svg>
      </div>

      <span className="text-xs select-none font-semibold text-center text-platinum/70 group-hover:text-platinum transition-colors">
        My Story
      </span>
    </button>
  );
}
