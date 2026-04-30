import { useEffect } from 'react';

import type { JSX, ReactNode } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function BottomSheet({ isOpen, onClose, title, children }: Props): JSX.Element {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full xs:max-w-89.5 s:max-w-94.5 bg-dark-charcoal border-t border-ebony-light rounded-t-3xl z-10 animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-ebony-light" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-ebony-light">
            <h2 className="font-bold text-platinum/85 text-base">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="size-7 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light hover:cursor-pointer active:scale-90 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-3.5 fill-platinum/70"
              >
                <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
              </svg>
            </button>
          </div>
        )}
        <div className="px-5 py-4 pb-8">{children}</div>
      </div>
    </div>
  );
}
