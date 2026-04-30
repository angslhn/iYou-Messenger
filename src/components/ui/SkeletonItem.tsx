import type { JSX } from 'react';

type Props = {
  type: 'chat' | 'friend' | 'circle-story' | 'story' | 'account' | 'profil' | 'message-list';
  isGroup?: boolean;
  showActions?: boolean;
};

function ChatSkeleton(): JSX.Element {
  return (
    <div className="flex justify-between items-center gap-3 py-2 border-b border-ebony-light">
      <div className="size-14 shrink-0 rounded-full bg-ebony-light/40 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-32 rounded-full bg-ebony-light/40 animate-pulse" />
        <div className="h-3 w-48 rounded-full bg-ebony-light/30 animate-pulse" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="h-3 w-8 rounded-full bg-ebony-light/30 animate-pulse" />
      </div>
    </div>
  );
}

function AccountSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col items-center pt-8 w-full">
      <div className="size-25 rounded-full border-2 border-ebony-light bg-ebony-light/40 animate-pulse mb-4" />
      <div className="h-5 w-48 rounded-md bg-ebony-light/40 animate-pulse mb-2" />
      <div className="h-3.5 w-24 rounded-md bg-ebony-light/30 animate-pulse mb-2" />
      <div className="h-9 w-48 rounded-md bg-ebony-light/40 animate-pulse mb-2" />
      <div className="h-7 w-32 rounded-md bg-ebony-light/40 animate-pulse mb-6" />
      <div className="w-full flex flex-col mt-4">
        <div className="h-4 w-24 rounded-md bg-ebony-light/40 animate-pulse mb-4" />
        <div className="w-full flex flex-col gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 w-full">
              <div className="size-10 rounded-xl border border-ebony-light bg-ebony-light/40 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-24 rounded-md bg-ebony-light/40 animate-pulse" />
                <div className="h-3.5 w-4/5 rounded-md bg-ebony-light/30 animate-pulse" />
              </div>
              <div className="size-4 rounded-md bg-ebony-light/30 animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton({ showActions }: { showActions?: boolean }): JSX.Element {
  return (
    <div className="flex flex-col w-full animate-pulse">
      <div className="flex flex-col items-center gap-2 py-8 px-5 border-b border-ebony-light">
        <div className="size-24 rounded-full bg-ebony-light/40 border-2 border-ebony-light" />
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <div className="h-6 w-48 rounded-md bg-ebony-light/40" />
          <div className="h-4 w-28 rounded-md bg-ebony-light/30" />
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="size-2 rounded-full bg-ebony-light/40" />
          <div className="h-3 w-20 rounded-md bg-ebony-light/30" />
        </div>
        <div className="mt-3 flex flex-col items-center gap-1">
          <div className="h-3 w-56 rounded-md bg-ebony-light/30" />
          <div className="h-3 w-40 rounded-md bg-ebony-light/30" />
        </div>
      </div>

      <div className="flex flex-col px-5 py-4 gap-1 border-b border-ebony-light">
        <div className="h-3 w-10 rounded-md bg-ebony-light/40 mb-2" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-ebony-light last:border-0"
          >
            <div className="size-10 shrink-0 rounded-xl bg-ebony-light/40 border border-ebony-light" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-16 rounded-md bg-ebony-light/30" />
              <div className="h-4 w-32 rounded-md bg-ebony-light/40" />
            </div>
          </div>
        ))}
      </div>
      {showActions && (
        <div className="flex flex-col px-5 py-4 gap-1">
          <div className="h-3 w-16 rounded-md bg-ebony-light/40 mb-2" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-ebony-light last:border-0"
            >
              <div className="size-10 shrink-0 rounded-xl bg-ebony-light/40 border border-ebony-light" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-4 w-24 rounded-md bg-ebony-light/40" />
                <div className="h-2.5 w-48 rounded-md bg-ebony-light/30" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CircleStorySkeleton(): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1.5 pt-0.5">
      <div className="size-15 rounded-full bg-ebony-light/40 animate-pulse" />
      <div className="w-12 h-2.5 rounded-full bg-ebony-light/30 animate-pulse" />
    </div>
  );
}

function FriendSkeleton(): JSX.Element {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-ebony-light">
      <div className="size-14 shrink-0 rounded-full bg-ebony-light/40 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-28 rounded-full bg-ebony-light/40 animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-ebony-light/30 animate-pulse" />
      </div>
      <div className="size-8 rounded-full bg-ebony-light/30 animate-pulse" />
    </div>
  );
}

function StorySkeleton(): JSX.Element {
  return <div className="aspect-3/4 rounded-2xl bg-ebony-light/40 animate-pulse" />;
}

function MessageListSkeleton({ isGroup = false }: { isGroup?: boolean } = {}): JSX.Element {
  return (
    <div className="flex-1 flex flex-col gap-6 p-4 animate-pulse overflow-hidden pointer-events-none select-none">
      <div className="flex gap-2 justify-start items-end">
        {isGroup && <div className="size-8 rounded-full bg-ebony-light shrink-0" />}
        <div className="flex flex-col gap-1 items-start">
          {isGroup && <div className="h-3 w-20 bg-ebony-light rounded-md" />}
          <div className="h-10 w-48 bg-ebony-light rounded-2xl rounded-bl-sm" />
        </div>
      </div>

      <div className="flex justify-end">
        <div className="h-10 w-64 bg-ebony-light/50 rounded-2xl rounded-br-sm" />
      </div>

      <div className="flex gap-2 justify-start items-end">
        {isGroup && <div className="size-8 rounded-full bg-ebony-light shrink-0" />}
        <div className="flex flex-col gap-1 items-start">
          {isGroup && <div className="h-3 w-24 bg-ebony-light rounded-md" />}
          <div className="h-10 w-32 bg-ebony-light rounded-2xl rounded-bl-sm" />
        </div>
      </div>

      <div className="flex justify-end">
        <div className="h-16 w-56 bg-ebony-light/50 rounded-2xl rounded-br-sm" />
      </div>
    </div>
  );
}

export default function SkeletonItem({ type, isGroup, showActions }: Props): JSX.Element {
  if (type === 'chat') return <ChatSkeleton />;
  if (type === 'friend') return <FriendSkeleton />;
  if (type === 'circle-story') return <CircleStorySkeleton />;
  if (type === 'account') return <AccountSkeleton />;
  if (type === 'profil') return <ProfileSkeleton showActions={showActions} />;
  if (type === 'message-list') return <MessageListSkeleton isGroup={isGroup} />;
  return <StorySkeleton />;
}
