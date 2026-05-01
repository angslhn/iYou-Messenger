import { useState, useEffect } from 'react';

import api from '../../lib/axios';
import BottomSheet from './BottomSheet';
import initialName from '../../helpers/initial-name';

import type { JSX } from 'react';

type Viewer = {
  id: string;
  username: string;
  fullname: string | null;
  avatar_url: string | null;
  viewed_at: string;
};

type Props = {
  isOpen: boolean;
  storyId: string | null;
  onClose: () => void;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function StoryViewersSheet({ isOpen, storyId, onClose }: Props): JSX.Element {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !storyId) return;

    const fetchViewers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/stories/${storyId}/viewers`);

        setViewers(data);
      } catch {
        /** empty */
      } finally {
        setLoading(false);
      }
    };

    fetchViewers();
  }, [isOpen, storyId]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Viewed by">
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto [scrollbar-width:none]">
        {loading ? (
          <div className="flex justify-center py-6">
            <svg
              className="animate-spin h-6 w-6 text-platinum/50"
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
          </div>
        ) : viewers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-10 fill-platinum/30"
            >
              <path d="M247.31,124.76c-.35-.79-8.82-19.74-27.65-38.57C194.57,61.1,162.88,48,128,48S61.43,61.1,36.34,86.19C17.51,105,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.74,27.65,38.57C61.43,194.9,93.12,208,128,208s66.57-13.1,91.66-38.19c18.83-18.83,27.3-37.78,27.65-38.57A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128a133.33,133.33,0,0,1,23.07-30.75C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.47,133.47,0,0,1,231,128a133.33,133.33,0,0,1-23.07,30.75C185.67,180.81,158.78,192,128,192ZM128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" />
            </svg>
            <span className="text-sm text-platinum/50 font-medium">No views yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {viewers.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="size-11 rounded-full overflow-hidden bg-dark-charcoal border border-ebony-light flex justify-center items-center font-bold text-platinum/80">
                  {v.avatar_url ? (
                    <img src={v.avatar_url} alt={v.username} className="size-full object-cover" />
                  ) : (
                    <span className="font-bold text-xl select-none text-platinum/85">
                      {initialName(v.fullname ?? v.username)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-platinum/90 text-sm">
                    {v.fullname || v.username}
                  </span>
                  <span className="text-xs text-platinum/50">{formatTime(v.viewed_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
