import { useState, useEffect } from 'react';

import api from '../../lib/axios';
import ws from '../../lib/ws';

import { useAuthStore } from '../../stores/useAuthStore';

import FriendStoryCircle from './FriendStoryCircle';
import SkeletonItem from './SkeletonItem';
import StoryViewer from './StoryViewer';

import type { JSX } from 'react';

type StoryItem = {
  id: string;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  content_text: string | null;
  bg_color: string | null;
  created_at: Date;
  is_seen: boolean;
};

type StoryGroup = {
  user_id: string;
  username: string;
  fullname: string;
  avatar_url: string | null;
  stories: StoryItem[];
};

export default function RecentStories(): JSX.Element | null {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number>(0);

  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    let isMounted = true;

    const fetchStories = async () => {
      try {
        const { data } = await api.get('/stories/feed');
        if (isMounted) setStoryGroups(data);
      } catch {
        /** empty */
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStories();

    const handleNewStory = () => {
      fetchStories();
    };

    ws.on('story:new', handleNewStory);

    return () => {
      isMounted = false;
      ws.off('story:new', handleNewStory);
    };
  }, []);

  const displayGroups = storyGroups
    .filter((group) => group.user_id !== currentUserId)
    .sort((a, b) => {
      const aHasUnseen = a.stories.some((s) => !s.is_seen);
      const bHasUnseen = b.stories.some((s) => !s.is_seen);

      if (aHasUnseen && !bHasUnseen) return -1;

      if (!aHasUnseen && bHasUnseen) return 1;

      return 0;
    });

  if (!isLoading && displayGroups.length === 0) {
    return null;
  }

  const handleOpenViewer = (index: number) => {
    setViewerGroupIndex(index);
    setViewerOpen(true);
  };

  const handleViewed = async (storyId: string) => {
    try {
      await api.post(`/stories/${storyId}/view`);

      setStoryGroups((prev) =>
        prev.map((group) => ({
          ...group,
          stories: group.stories.map((story) =>
            story.id === storyId ? { ...story, is_seen: true } : story,
          ),
        })),
      );
    } catch {
      /** empty */
    }
  };

  return (
    <>
      <section className="w-full overflow-x-auto [scrollbar-width:none] py-2">
        <ul className="flex flex-nowrap items-start px-4 gap-4">
          {isLoading ? (
            <>
              <li className="shrink-0">
                <SkeletonItem type="circle-story" />
              </li>
              <li className="shrink-0">
                <SkeletonItem type="circle-story" />
              </li>
              <li className="shrink-0">
                <SkeletonItem type="circle-story" />
              </li>
              <li className="shrink-0">
                <SkeletonItem type="circle-story" />
              </li>
              <li className="shrink-0">
                <SkeletonItem type="circle-story" />
              </li>
            </>
          ) : (
            displayGroups.map((group, index) => {
              const isGroupFullySeen = group.stories.every((story) => story.is_seen);

              return (
                <li
                  key={group.user_id}
                  className="shrink-0 hover:cursor-pointer active:scale-95 transition-transform"
                  onClick={() => handleOpenViewer(index)}
                >
                  <FriendStoryCircle
                    data={{
                      thumbnail: group.stories[0]?.media_url ?? '',
                      name: group.fullname ?? group.username,
                      isSeen: isGroupFullySeen,
                    }}
                  />
                </li>
              );
            })
          )}
          <li className="w-0.5 shrink-0" aria-hidden="true" />
        </ul>
      </section>
      <StoryViewer
        isOpen={viewerOpen}
        groups={displayGroups}
        initialGroupIndex={viewerGroupIndex}
        onClose={() => setViewerOpen(false)}
        onViewed={handleViewed}
      />
    </>
  );
}
