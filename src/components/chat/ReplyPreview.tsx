import type { JSX } from 'react';

type Props = {
  replyTo: {
    id: string;
    senderName: string;
    content: string;
  };
  onCancel: () => void;
};

export default function ReplyPreview({ replyTo, onCancel }: Props): JSX.Element {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-ebony-light bg-dark-charcoal">
      <div className="w-0.5 h-10 bg-platinum/60 rounded-full shrink-0" />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs font-bold text-platinum/70 truncate">{replyTo.senderName}</span>
        <span className="text-xs text-platinum/45 truncate">{replyTo.content}</span>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 size-6 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light hover:cursor-pointer active:scale-90 transition-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="size-3 fill-platinum/50"
        >
          <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
        </svg>
      </button>
    </div>
  );
}
