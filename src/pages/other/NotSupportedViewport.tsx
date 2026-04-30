import type { JSX } from 'react';

export default function NotSupportedViewport(): JSX.Element {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center text-center px-4 bg-night">
      <div className="max-w-md flex flex-col items-center p-8 bg-dark-charcoal rounded-3xl border border-ebony-light shadow-2xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="size-20 fill-platinum/50 mb-4"
        >
          <path d="M216,40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V144H40V56ZM40,176h72v16H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16H144V176h72Z" />
        </svg>
        <h2 className="text-2xl font-bold text-platinum/85 mb-2">Mobile App</h2>
        <p className="text-sm text-platinum/50 leading-relaxed mb-6">
          iYou Messenger is strictly optimized for mobile devices. Please open this app on your
          smartphone for the best experience.
        </p>
      </div>
    </main>
  );
}
