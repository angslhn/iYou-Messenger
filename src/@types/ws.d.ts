export type ClientToServerEvent =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { event: 'ping'; payload?: any }
  | {
      event: 'message:send';
      payload: {
        receiverId?: string;
        conversationId?: string;
        content: string;
        replyToMessageId?: string;
      };
    }
  | { event: 'message:read'; payload: { messageId: string; senderId: string } }
  | { event: 'message:edit'; payload: { messageId: string; content: string } }
  | { event: 'message:react'; payload: { messageId: string; reaction: string } }
  | { event: 'message:delete'; payload: { messageId: string } }
  | { event: 'typing:start'; payload: { conversationId?: string; receiverId?: string } }
  | { event: 'typing:stop'; payload: { conversationId?: string; receiverId?: string } }
  | { event: 'group:delete'; payload: { conversationId: string } }
  | { event: 'group:leave'; payload: { conversationId: string } };

export type ServerToClientEvent =
  | { event: 'pong'; payload: { timestamp: string } }
  | {
      event: 'message:receive';
      payload: {
        id: string;
        conversationId: string;
        senderId: string;
        content: string;
        replyToMessageId: string | null;
        createdAt: string;
      };
    }
  | { event: 'message:read'; payload: { messageId: string; readerId: string; readAt: string } }
  | { event: 'message:deleted'; payload: { messageId: string; conversationId: string } }
  | {
      event: 'message:edited';
      payload: { messageId: string; content: string; conversationId: string };
    }
  | {
      event: 'message:react_updated';
      payload: { messageId: string; userId: string; reaction: string; conversationId: string };
    }
  | { event: 'user:online'; payload: { userId: string } }
  | { event: 'user:offline'; payload: { userId: string; lastSeen: Date | null } }
  | { event: 'user:update_avatar'; payload: { userId: string; avatarUrl: string } }
  | { event: 'typing:start'; payload: { conversationId: string; userId: string } }
  | { event: 'typing:stop'; payload: { conversationId: string; userId: string } }
  | { event: 'group:update_avatar'; payload: { conversationId?: string; avatarUrl: string } }
  | {
      event: 'group:update_info';
      payload: { conversationId: string; name: string | null; description: string | null };
    }
  | { event: 'group:deleted'; payload: { conversationId: string } }
  | { event: 'group:member_left'; payload: { conversationId: string; userId: string } }
  | {
      event: 'group:member_added';
      payload: { conversationId: string; addedBy: string; newMemberId: string };
    }
  | {
      event: 'group:member_removed';
      payload: { conversationId: string; removedBy: string; removedMemberId: string };
    }
  | {
      event: 'group:invite_received';
      payload: {
        inviteId: string;
        conversationId: string;
        groupName: string;
        inviterUsername: string;
        inviterFullname: string | null;
      };
    }
  | {
      event: 'friend:request_received';
      payload: {
        friendshipId: string;
        requesterId: string;
        requesterUsername: string;
        requesterFullname: string | null;
        requesterAvatarUrl: string | null;
      };
    }
  | {
      event: 'friend:request_accepted';
      payload: { friendshipId: string; receiverId: string; receiverUsername: string };
    }
  | {
      event: 'friend:new_friend';
      payload: {
        friendshipId: string;
        friendId: string;
        friendUsername: string;
        friendFullname: string | null;
        friendAvatarUrl: string | null;
      };
    }
  | { event: 'story:new'; payload: { userId: string; storyId: string } }
  | { event: 'error'; payload: { message: string } }
  | { event: 'auth:force_logout'; payload: { reason: string } }; // Event internal khusus Frontend

export type OutgoingEventMap = {
  [E in ClientToServerEvent as E['event']]: E extends { payload: infer P } ? P : undefined;
};

export type IncomingEventMap = {
  [E in ServerToClientEvent as E['event']]: E extends { payload: infer P } ? P : undefined;
};
