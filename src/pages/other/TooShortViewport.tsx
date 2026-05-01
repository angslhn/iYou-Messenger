import type { JSX } from 'react';

export default function TooShortViewport(): JSX.Element {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center text-center px-4 bg-night">
      <div className="w-full flex flex-col items-center p-6 bg-dark-charcoal rounded-3xl border border-ebony-light shadow-2xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="size-16 fill-platinum/50 mb-4"
        >
          <path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16ZM184,216a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8ZM128,176a16,16,0,1,0,16,16A16,16,0,0,0,128,176Z" />
        </svg>
        <h2 className="text-xl font-bold text-platinum/85 mb-2 select-none">Screen Too Short</h2>
        <p className="text-xs text-platinum/50 leading-relaxed select-none">
          iYou Messenger requires a minimum screen height of 560px. Please use a higher resolution
          device for the best experience.
        </p>
      </div>
    </main>
  );
}
