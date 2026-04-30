import { useState, useEffect } from 'react';

import api from '../../lib/axios';

import { useAuthStore } from '../../stores/useAuthStore';

import RootLayout from '../../components/layouts/RootLayout';
import MainLayout from '../../components/layouts/MainLayout';

import StoryCard from '../../components/ui/StoryCard';
import CreateStorySheet from '../../components/ui/CreateStorySheet';
import StoryViewer from '../../components/ui/StoryViewer';
import SkeletonItem from '../../components/ui/SkeletonItem';
import EmptyState from '../../components/ui/EmptyState';

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

export default function Story(): JSX.Element {
  const [createOpen, setCreateOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = useAuthStore((state) => state.user?.id);

  const fetchStories = async () => {
    setIsLoading(true);

    try {
      const { data } = await api.get('/stories/feed');
      setStoryGroups(data);
    } catch {
      /** empty */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleOpenViewer = (groupIndex: number) => {
    setViewerGroupIndex(groupIndex);
    setViewerOpen(true);
  };

  const handleViewed = async (storyId: string) => {
    try {
      await api.post(`/stories/${storyId}/view`);
    } catch {
      /** empty */
    }
  };

  const myStoryGroup = storyGroups.find((group) => group.user_id === currentUserId);
  const friendStoryGroups = storyGroups.filter((group) => group.user_id !== currentUserId);

  const checkAllSeen = (stories: StoryItem[]) => {
    return stories.every((story) => story.is_seen === true);
  };

  return (
    <RootLayout>
      <MainLayout>
        <section
          aria-label="Create Story"
          onClick={() => {
            if (myStoryGroup) {
              const myIndex = storyGroups.findIndex((g) => g.user_id === currentUserId);
              handleOpenViewer(myIndex);
            } else {
              setCreateOpen(true);
            }
          }}
          className="relative p-3 w-full flex items-center gap-2 rounded-2xl bg-dark-deep border border-ebony-light group cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="h-full aspect-square flex justify-center items-center">
            <div
              className={`size-15 flex justify-center items-center rounded-full border-2 transition-colors overflow-hidden
              ${myStoryGroup ? 'border-platinum' : 'border-dashed border-ebony-light group-hover:border-platinum/50'}`}
            >
              {myStoryGroup && myStoryGroup.avatar_url ? (
                <img
                  src={myStoryGroup.avatar_url}
                  alt="My Avatar"
                  className="size-full object-cover"
                />
              ) : myStoryGroup ? (
                <span className="font-bold text-lg text-platinum uppercase">
                  {myStoryGroup.username.charAt(0)}
                </span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="size-6 fill-platinum/70"
                >
                  <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-platinum/85 select-none">My Story</h2>
            <p className="font-medium text-sm text-platinum/70 leading-tight select-none">
              {myStoryGroup ? 'Tap to view your updates' : 'Tap to add a story'}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCreateOpen(true);
            }}
            className="absolute right-4 flex justify-center items-center size-7 rounded-full bg-platinum/85 hover:cursor-pointer hover:bg-platinum active:scale-90 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-5 fill-dark-charcoal"
            >
              <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
            </svg>
          </button>
        </section>
        <section aria-label="recent-stories" className="flex flex-col gap-4 mt-6 pb-5">
          <h2 className="font-bold text-xs text-platinum/50 tracking-wider select-none">RECENT</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SkeletonItem type="story" />
              <SkeletonItem type="story" />
              <SkeletonItem type="story" />
              <SkeletonItem type="story" />
            </div>
          ) : friendStoryGroups.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className="size-8 fill-platinum/85"
                  >
                    <path d="M64 480L64 272L200.2 272C213.7 251.8 232.2 235.2 253.9 224L64 224L64 189.7C64 154.4 92.7 125.7 128 125.7L128.1 125.7C129.3 109.1 143.1 96 160 96L192 96C208.9 96 222.7 109.1 223.9 125.7L256 125.7L307.2 101.9C315.6 98 324.8 95.9 334.1 95.9L512 96C547.3 96 576 124.7 576 160L576 224L386 224C407.7 235.2 426.2 251.8 439.7 272L575.9 272L575.9 480C575.9 515.3 547.2 544 511.9 544L128 544C92.7 544 64 515.3 64 480zM320 256C284.9 254.9 252.1 272.9 234.2 303.1C216.3 333.3 216.3 370.8 234.2 401C252.1 431.2 284.9 449.2 320 448.1C355.1 449.2 387.9 431.2 405.8 401C423.7 370.8 423.7 333.3 405.8 303.1C387.9 272.9 355.1 254.9 320 256z" />
                  </svg>
                }
                title="No stories yet"
                description="Stories from you and your friends will appear here"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {friendStoryGroups.map((group) => {
                const actualIndex = storyGroups.findIndex((g) => g.user_id === group.user_id);

                return (
                  <div
                    key={group.user_id}
                    onClick={() => handleOpenViewer(actualIndex)}
                    className="hover:cursor-pointer active:scale-95 transition-transform"
                  >
                    <StoryCard
                      data={{
                        name: group.fullname || group.username,
                        avatar: group.avatar_url,
                        time: new Intl.DateTimeFormat('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(group.stories[0].created_at)),
                        thumbnail: group.stories[0].media_url,
                        count: group.stories.length,
                        isSeen: checkAllSeen(group.stories),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </MainLayout>
      <CreateStorySheet
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          fetchStories();
        }}
      />
      <StoryViewer
        isOpen={viewerOpen}
        groups={storyGroups}
        initialGroupIndex={viewerGroupIndex}
        onClose={() => {
          setViewerOpen(false);
          fetchStories();
        }}
        onViewed={handleViewed}
      />
    </RootLayout>
  );
}
