import type { JSX } from 'react';

export default function TypingIndicator(): JSX.Element {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-night border border-ebony-light">
        <span className="size-1.5 rounded-full bg-platinum/50 animate-bounce [animation-delay:0ms]" />
        <span className="size-1.5 rounded-full bg-platinum/50 animate-bounce [animation-delay:150ms]" />
        <span className="size-1.5 rounded-full bg-platinum/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
