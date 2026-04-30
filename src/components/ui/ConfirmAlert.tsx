import { useEffect } from 'react';
import { useAlertStore } from '../../stores/useAlertStore';

import type { JSX } from 'react';

export default function ConfirmAlert(): JSX.Element | null {
  const {
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    isDanger,
    isLoading,
    onConfirm,
    closeAlert,
    setLoading,
  } = useAlertStore();

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

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
      closeAlert();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={!isLoading ? closeAlert : undefined}
      />

      <div className="relative w-full max-w-88 bg-dark-charcoal border border-ebony-light rounded-3xl p-6 shadow-2xl animate-slide-up z-10">
        <h2 className="text-xl font-bold text-platinum/85 mb-2">{title}</h2>
        <p className="text-sm text-platinum/60 leading-relaxed mb-6">{description}</p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={closeAlert}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-platinum/85 bg-dark-deep border border-ebony-light active:scale-95 transition-all disabled:opacity-50 hover:cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 flex justify-center items-center py-3 rounded-xl font-bold text-sm text-dark-charcoal active:scale-95 transition-all disabled:opacity-50 hover:cursor-pointer ${
              isDanger ? 'bg-red-500' : 'bg-platinum/85'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin size-5 text-dark-charcoal"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
