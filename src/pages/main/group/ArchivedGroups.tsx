import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../lib/axios';

import { useChatStore } from '../../../stores/useChatStore';

import SectionLayout from '../../../components/layouts/SectionLayout';
import ArrowLeftIcon from '../../../components/icons/ArrowLeftIcon';
import ChatListMenu from '../../../components/ui/ChatListMenu';
import EmptyState from '../../../components/ui/EmptyState';
import PinnedIcon from '../../../components/icons/PinnedIcon';
import SkeletonItem from '../../../components/ui/SkeletonItem';

import type { MouseEvent, JSX } from 'react';
import type { ConversationResponse } from '../../../@types/globals';
import type { GroupItem } from './Group';

export default function ArchivedGroups(): JSX.Element {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [archivedGroups, setArchivedGroups] = useState<GroupItem[]>([]);

  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchArchivedGroups = async () => {
      setIsLoading(true);
      try {
        const {
          data: { conversations },
        } = await api.get<ConversationResponse>('/conversations/group/archive');

        const formattedGroups: GroupItem[] = conversations.map((conversation) => {
          const messageTime = conversation.last_message
            ? new Date(conversation.last_message.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined;

          return {
            id: conversation.id,
            name: conversation.name || 'Unnamed Group',
            avatar_url: conversation.avatar_url,
            description: conversation.description,
            isPinned: conversation.is_pinned,
            isArchived: conversation.is_archived,
            isMuted: conversation.is_muted,
            lastMessage: conversation.last_message
              ? conversation.last_message.content
              : 'No messages yet',
            time: messageTime,
            unreadCount: conversation.unread_count,
            type: 'group',
            role: conversation.role as 'admin' | 'member',
          };
        });

        setArchivedGroups(formattedGroups);
      } catch {
        /** empty */
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchivedGroups();
  }, []);

  const handleLongPressStart = (group: GroupItem) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedGroup(group);
      setMenuOpen(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleOpenChat = (group: GroupItem) => {
    setActiveChat({
      id: group.id,
      name: group.name,
      avatar_url: group.avatar_url,
      description: group.description,
      type: group.type,
      role: group.role,
      is_pinned: group.isPinned,
      is_muted: group.isMuted,
      is_archived: group.isArchived,
      created_at: new Date().toISOString(),
      last_cleared_at: null,
      unread_count: group.unreadCount || 0,
      last_message: null,
    });

    navigate('/group/open');
  };

  const handleContextMenu = (group: GroupItem) => (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSelectedGroup(group);
    setMenuOpen(true);
  };

  const handlePin = async (groupId: string, currentPinStatus: boolean) => {
    const newValue = !currentPinStatus;

    setArchivedGroups((prev) => {
      const updated = prev.map((g) => (g.id === groupId ? { ...g, isPinned: newValue } : g));
      return updated.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
    });

    try {
      await api.patch(`/conversations/${groupId}/pin`, { value: newValue });
    } catch {
      setArchivedGroups((prev) => {
        const reverted = prev.map((g) =>
          g.id === groupId ? { ...g, isPinned: currentPinStatus } : g,
        );

        return reverted.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
      });
    }
  };

  const handleArchive = async (groupToArchive: GroupItem) => {
    const newValue = !groupToArchive.isArchived;

    if (newValue === false) {
      setArchivedGroups((prev) => prev.filter((g) => g.id !== groupToArchive.id));
    }

    try {
      await api.patch(`/conversations/${groupToArchive.id}/archive`, { value: newValue });
    } catch {
      setArchivedGroups((prev) =>
        [...prev, groupToArchive].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)),
      );
    }
  };

  const handleMute = async (groupId: string, currentMuteStatus: boolean) => {
    const newValue = !currentMuteStatus;

    setArchivedGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isMuted: newValue } : g)),
    );

    try {
      await api.patch(`/conversations/${groupId}/mute`, { value: newValue });
    } catch {
      setArchivedGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, isMuted: currentMuteStatus } : g)),
      );
    }
  };

  const handleClearChat = async (groupToClear: GroupItem) => {
    setArchivedGroups((prev) => prev.filter((g) => g.id !== groupToClear.id));

    try {
      await api.patch(`/conversations/${groupToClear.id}/clear`);
    } catch {
      setArchivedGroups((prev) =>
        [...prev, groupToClear].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)),
      );
    }
  };

  const renderGroupItem = (group: GroupItem) => (
    <article
      key={group.id}
      onMouseDown={() => handleLongPressStart(group)}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={() => handleLongPressStart(group)}
      onTouchEnd={handleLongPressEnd}
      onClick={() => handleOpenChat(group)}
      onContextMenu={handleContextMenu(group)}
      className="flex items-center gap-3 py-2 border-b border-ebony-light select-none active:opacity-70 transition-opacity hover:cursor-pointer"
    >
      <div className="size-14 shrink-0 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light">
        {group.name && !group.avatar_url ? (
          <span className="font-bold text-3xl text-platinum/85 select-none" aria-hidden="true">
            {group.name.charAt(0)}
          </span>
        ) : (
          group.avatar_url && (
            <img
              src={group.avatar_url}
              alt={`Avatar ${group?.name}`}
              draggable={false}
              className="w-full h-full object-cover rounded-full"
            />
          )
        )}
      </div>
      <div className="w-full min-w-0 flex justify-between">
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold truncate">{group.name}</h3>
          <p
            className={`font-medium text-xs truncate ${group.lastMessage === 'No messages yet' ? 'text-platinum/40 italic' : 'text-platinum/70'}`}
          >
            {group.lastMessage}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between gap-1 py-0.5 shrink-0">
          <time
            className={`text-xs select-none ${group.unreadCount ? 'text-platinum/85 font-semibold' : 'text-platinum/70'}`}
          >
            {group.time}
          </time>
          <div className="flex items-center gap-1">
            {group.isPinned && !group.unreadCount && <PinnedIcon />}
            {group.isMuted && !group.unreadCount && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="size-3.5 fill-platinum/40"
              >
                <path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.4 479.7C530.6 477.3 543.9 462.4 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 99.2C249.4 107 215.8 128.8 192.8 158.9L73 39.1zM160 277.6C160 325.7 143.6 372.4 113.6 410L103.8 422.2C98.8 428.5 96 436.3 96 444.4C96 464 111.9 479.9 131.5 479.9L366.8 479.9L159.9 273L159.9 277.5zM320 576C349.8 576 374.9 555.6 382 528L258 528C265.1 555.6 290.2 576 320 576z" />
              </svg>
            )}
            {group.unreadCount ? (
              <span className="flex justify-center items-center px-1.5 min-w-5 h-5 rounded-full bg-platinum/85 text-dark-charcoal text-[10px] font-bold">
                {group.unreadCount > 99 ? '99+' : group.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-5 border-b border-ebony-light shrink-0">
        <button type="button" onClick={() => navigate('/group')} className="hover:cursor-pointer">
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-xl text-platinum/85">Archived Groups</h1>
      </nav>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-4">
        {isLoading ? (
          <div className="flex flex-col mt-2">
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
            <SkeletonItem type="chat" />
          </div>
        ) : archivedGroups.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="size-8 fill-platinum/85"
                >
                  <path d="M64 128C64 110.3 78.3 96 96 96L544 96C561.7 96 576 110.3 576 128L576 160C576 177.7 561.7 192 544 192L96 192C78.3 192 64 177.7 64 160L64 128zM96 240L544 240L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 240zM248 304C234.7 304 224 314.7 224 328C224 341.3 234.7 352 248 352L392 352C405.3 352 416 341.3 416 328C416 314.7 405.3 304 392 304L248 304z" />
                </svg>
              }
              title="No archived groups"
              description="Archived groups will appear here"
            />
          </div>
        ) : (
          <div className="flex flex-col text-platinum/85 mt-2">
            {archivedGroups
              .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
              .map((group) => renderGroupItem(group))}
          </div>
        )}
      </div>
      {selectedGroup && (
        <ChatListMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          isGroup={true}
          isPinned={selectedGroup.isPinned}
          isArchived={selectedGroup.isArchived}
          isMuted={selectedGroup.isMuted}
          conversationName={selectedGroup.name}
          onPin={() => handlePin(selectedGroup.id, selectedGroup.isPinned)}
          onArchive={() => handleArchive(selectedGroup)}
          onMute={() => handleMute(selectedGroup.id, selectedGroup.isMuted)}
          onClearChat={() => handleClearChat(selectedGroup)}
        />
      )}
    </SectionLayout>
  );
}
