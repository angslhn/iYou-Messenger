import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

import StoryViewersSheet from './StoryViewersSheet';

import type { JSX } from 'react';

type StoryItem = {
  id: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  content_text: string | null;
  bg_color: string | null;
  created_at: Date;
};

type StoryGroup = {
  user_id: string;
  username: string;
  fullname: string;
  avatar_url: string | null;
  stories: StoryItem[];
};

type Props = {
  isOpen: boolean;
  groups: StoryGroup[];
  initialGroupIndex?: number;
  onClose: () => void;
  onViewed?: (storyId: string) => void;
};

const STORY_DURATION = 5000;

function formatTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000 / 60);

  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}h ago`;

  return `${Math.floor(diff / 60 / 24)}d ago`;
}

export default function StoryViewer({
  isOpen,
  groups,
  initialGroupIndex = 0,
  onClose,
  onViewed,
}: Props): JSX.Element {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [viewersSheetOpen, setViewersSheetOpen] = useState(false);
  const [duration, setDuration] = useState(STORY_DURATION);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line react-hooks/purity
  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);
  const touchStartRef = useRef<number>(0);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const isVideo = currentStory?.media_type === 'video';
  const isImage = currentStory?.media_type === 'image';

  const currentUserId = useAuthStore((state) => state.user?.id);
  const isMyOwnStory = currentGroup?.user_id === currentUserId;

  const handleOpenViewers = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePause();
    setViewersSheetOpen(true);
  };

  const handleCloseViewers = () => {
    setViewersSheetOpen(false);
    handleResume();
  };

  const goNext = useCallback(() => {
    if (!currentGroup) return;
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }

    setProgress(0);
    elapsedRef.current = 0;
    setIsVideoLoaded(false);
  }, [currentGroup, storyIndex, groupIndex, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((prev) => prev - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    }
    setProgress(0);
    elapsedRef.current = 0;
    setIsVideoLoaded(false);
  }, [storyIndex, groupIndex, groups]);

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoDist = e.currentTarget.duration;
    if (videoDist) {
      setDuration(videoDist * 1000);
      setIsVideoLoaded(true);
    }
  };

  useEffect(() => {
    if (!isOpen || paused || !currentStory || (isVideo && !isVideoLoaded)) return;

    if (currentStory.id && !isMyOwnStory) {
      onViewed?.(currentStory.id);
    }

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timerRef.current!);
        goNext();
      }
    }, 16);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isOpen,
    paused,
    storyIndex,
    groupIndex,
    currentStory,
    goNext,
    onViewed,
    isMyOwnStory,
    duration,
    isVideo,
    isVideoLoaded,
  ]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
    handlePause();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;

    if (touchEnd - touchStartRef.current > 100) {
      onClose();
    } else {
      handleResume();
    }
  };

  const handlePause = () => {
    setPaused(true);
    elapsedRef.current += Date.now() - startTimeRef.current;
    videoRef.current?.pause();
  };

  const handleResume = () => {
    setPaused(false);
    startTimeRef.current = Date.now();
    videoRef.current?.play();
  };

  if (!isOpen || !currentGroup || !currentStory) return <></>;

  return (
    <div className="fixed inset-0 z-100 bg-black flex items-center justify-center select-none touch-none">
      <div className="relative w-full h-full sm:max-w-md flex flex-col bg-dark-charcoal shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 px-2 pt-3 bg-linear-to-b from-black/60 to-transparent pb-8">
          {currentGroup.stories.map((story, idx) => (
            <div key={story.id} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute top-8 left-0 right-0 z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full border border-white/20 overflow-hidden bg-dark-deep/75">
              {currentGroup.avatar_url ? (
                <img
                  src={currentGroup.avatar_url}
                  alt={`Avatar ${currentGroup.fullname}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-bold text-[1.1rem] select-none text-platinum/85">
                  {currentGroup.fullname.charAt(0).toUpperCase() ||
                    currentGroup.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white drop-shadow-md">
                {`${currentGroup.fullname ?? '@' + currentGroup.username}`}
              </span>
              <span className="text-[10px] text-white/70 drop-shadow-md">
                {formatTimeAgo(currentStory.created_at)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:opacity-70 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-6 fill-white drop-shadow-md"
            >
              <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
            </svg>
          </button>
        </div>
        <div
          className="relative flex-1 flex items-center justify-center"
          onMouseDown={handlePause}
          onMouseUp={handleResume}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentStory.media_url && isImage && (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="size-full object-contain bg-black"
              draggable={false}
            />
          )}
          {currentStory.media_url && isVideo && (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className="size-full object-contain bg-black"
              autoPlay
              playsInline
              onLoadedMetadata={handleVideoLoad}
            />
          )}
          {(currentStory.content_text || !currentStory.media_url) && (
            <div
              className={`absolute inset-0 flex items-center justify-center px-8 text-center
                ${!currentStory.media_url ? '' : 'bg-linear-to-t from-black/80 via-transparent to-transparent z-40'}`}
              style={{
                backgroundColor: !currentStory.media_url
                  ? (currentStory.bg_color ?? '#1a1a2e')
                  : 'transparent',
              }}
            >
              <p
                className={`text-white font-semibold text-lg leading-relaxed wrap-break-word
                ${currentStory.media_url ? 'absolute bottom-20 px-4' : ''}`}
              >
                {currentStory.content_text}
              </p>
            </div>
          )}
        </div>
        {isMyOwnStory && (
          <button
            onClick={handleOpenViewers}
            className="absolute bottom-6 right-4 z-50 flex items-center justify-center size-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 active:scale-90 transition-all cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-6 fill-white"
            >
              <path d="M247.31,124.76c-.35-.79-8.82-19.74-27.65-38.57C194.57,61.1,162.88,48,128,48S61.43,61.1,36.34,86.19C17.51,105,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.74,27.65,38.57C61.43,194.9,93.12,208,128,208s66.57-13.1,91.66-38.19c18.83-18.83,27.3-37.78,27.65-38.57A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128a133.33,133.33,0,0,1,23.07-30.75C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.47,133.47,0,0,1,231,128a133.33,133.33,0,0,1-23.07,30.75C185.67,180.81,158.78,192,128,192ZM128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" />
            </svg>
          </button>
        )}
        <StoryViewersSheet
          isOpen={viewersSheetOpen}
          storyId={currentStory.id}
          onClose={handleCloseViewers}
        />
        <div className="absolute inset-0 z-30 flex pointer-events-none">
          <div
            className="w-1/4 h-full pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          />
          <div className="w-2/4 h-full" />
          <div
            className="w-1/4 h-full pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          />
        </div>
      </div>
    </div>
  );
}
