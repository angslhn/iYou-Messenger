import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';

import ws from '../lib/ws';
import api from '../lib/axios';

import type { Conversation } from '../@types/globals';

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  reply_to_message_id?: string | null;
  is_edited?: boolean;
  deleted_at?: string | null;
  reads?: {
    user_id: string;
    read_at: string;
  }[];
  reactions?: {
    id: string;
    user_id: string;
    reaction: string;
  }[];
};

export type ParticipantData = {
  user_id: string;
  username: string;
  fullname: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member';
};

type MessageReceivePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  replyToMessageId: string | null;
  createdAt: string;
};

interface ChatState {
  activeChat: Conversation | null;
  conversations: Conversation[];
  messagesByChat: Record<string, Message[]>;
  onlineUsers: Record<string, boolean>;
  typingStatus: Record<string, string[]>;
  isFetchingMessages: boolean;
  participantsByChat: Record<string, ParticipantData[]>;

  setActiveChat: (chat: Conversation | null) => void;
  markMessagesAsRead: (conversationId: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchParticipants: (conversationId: string) => Promise<void>;
  initChatListeners: () => void;
  clearChatListeners: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeChat: null,
  conversations: [],
  messagesByChat: {},
  onlineUsers: {},
  participantsByChat: {},
  typingStatus: {},
  isFetchingMessages: false,

  setActiveChat: (chat) => set({ activeChat: chat }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (conversationId, messages) => {
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [conversationId]: messages,
      },
    }));
  },
  markMessagesAsRead: (conversationId: string) => {
    const myUserId = useAuthStore.getState().user?.id;
    if (!myUserId) return;

    const messages = get().messagesByChat[conversationId] || [];

    // Filter: pesan yang bukan dari kita, belum dihapus, dan belum ada read receipt dari kita
    const unreadMessages = messages.filter(
      (msg) =>
        msg.sender_id !== myUserId &&
        !msg.deleted_at &&
        !msg.reads?.some((r) => r.user_id === myUserId),
    );

    // Kirim message:read ke server untuk setiap pesan yang belum dibaca
    unreadMessages.forEach((msg) => {
      ws.send('message:read', {
        messageId: msg.id,
        senderId: msg.sender_id,
      });
    });

    // Optimistic update: tandai sudah dibaca di local state
    if (unreadMessages.length === 0) return;

    const now = new Date().toISOString();

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [conversationId]: state.messagesByChat[conversationId].map((msg) => {
          const shouldMark = unreadMessages.some((u) => u.id === msg.id);
          if (!shouldMark) return msg;

          return {
            ...msg,
            reads: [...(msg.reads || []), { user_id: myUserId, read_at: now }],
          };
        }),
      },
    }));
  },
  addMessage: (message) => {
    const { conversation_id } = message;
    set((state) => {
      const existing = state.messagesByChat[conversation_id] || [];
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [conversation_id]: [...existing, message],
        },
      };
    });
  },
  fetchParticipants: async (conversationId) => {
    // CACHE: Jangan tembak API jika data partisipan sudah ada di memori
    const existingParticipants = get().participantsByChat[conversationId];

    if (existingParticipants && existingParticipants.length > 0) return;

    try {
      const { data } = await api.get(`/conversations/${conversationId}/participants`);

      set((state) => ({
        participantsByChat: {
          ...state.participantsByChat,
          [conversationId]: data,
        },
      }));
    } catch {
      /** empty */
    }
  },
  fetchMessages: async (conversationId, forceRefresh = false) => {
    const existingMessages = get().messagesByChat[conversationId];

    if (!forceRefresh && existingMessages && existingMessages.length > 0) return;

    set({ isFetchingMessages: true });

    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);

      const fetchedMessages = Array.isArray(data) ? data : [];

      set((state) => ({
        messagesByChat: {
          ...state.messagesByChat,
          [conversationId]: fetchedMessages,
        },
      }));
    } catch {
      /** empty */
    } finally {
      set({ isFetchingMessages: false });
    }
  },
  clearChatListeners: () => {
    ws.off('message:receive');
    ws.off('message:edited');
    ws.off('message:deleted');
    ws.off('message:react_updated');
    ws.off('user:online');
    ws.off('user:offline');
    ws.off('typing:start');
    ws.off('typing:stop');
    ws.off('group:update_avatar');
    ws.off('group:update_info');
    ws.off('group:member_added');
    ws.off('group:member_removed');
    ws.off('group:member_left');
    ws.off('group:deleted');
  },
  initChatListeners: () => {
    // Bersihkan dulu dari memori jaga-jaga kalau ada sisa HMR Vite
    get().clearChatListeners();

    // Pesan Baru Masuk
    ws.on('message:receive', (payload: MessageReceivePayload) => {
      const conversationId = payload.conversationId;
      const currentActiveChat = get().activeChat;
      const myUserId = useAuthStore.getState().user?.id;

      // Menyesuaikan properti object agar menjamin UI tidak akan error karena property undefined
      const newMessage: Message = {
        id: payload.id,
        conversation_id: conversationId,
        sender_id: payload.senderId,
        content: payload.content,
        created_at: payload.createdAt,
        reply_to_message_id: payload.replyToMessageId || null,
        is_edited: false,
        deleted_at: null,
        reads: [],
        reactions: [],
      };

      // Tambahkan pesan ke Cache
      set((state) => {
        const existingMessages = state.messagesByChat[conversationId] || [];

        // Cegah duplikasi
        const isDuplicate = existingMessages.some((msg) => msg.id === newMessage.id);

        if (isDuplicate) return state;

        return {
          messagesByChat: {
            ...state.messagesByChat,
            [conversationId]: [...existingMessages, newMessage],
          },
        };
      });

      // Update last_message & unread_count
      set((state) => {
        const updatedConversations = state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              last_message: {
                id: newMessage.id,
                content: newMessage.content,
                sender_id: newMessage.sender_id,
                created_at: newMessage.created_at,
              },
              unread_count:
                currentActiveChat?.id !== conversationId
                  ? (conv.unread_count || 0) + 1
                  : conv.unread_count,
            };
          }

          return conv;
        });

        // Pindahkan percakapan yang baru aktif ke atas
        const activeConvIndex = updatedConversations.findIndex((c) => c.id === conversationId);

        if (activeConvIndex > 0) {
          const [activeConv] = updatedConversations.splice(activeConvIndex, 1);
          updatedConversations.unshift(activeConv);
        }

        return { conversations: updatedConversations };
      });

      if (currentActiveChat?.id === conversationId && payload.senderId !== myUserId) {
        ws.send('message:read', {
          messageId: payload.id,
          senderId: payload.senderId,
        });

        // Optimistic update untuk pesan yang baru masuk ini
        const now = new Date().toISOString();

        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [conversationId]: state.messagesByChat[conversationId]?.map((msg) =>
              msg.id === payload.id
                ? { ...msg, reads: [...(msg.reads || []), { user_id: myUserId!, read_at: now }] }
                : msg,
            ),
          },
        }));
      }

      // Update activeChat.id jika masih kosong — satu blok saja, tidak duplikat
      const currentActive = get().activeChat;

      if (currentActive?.id === '') {
        const isOwnMessage = payload.senderId === myUserId;
        const isTargetUserMessage = currentActive?.target_user_id === payload.senderId;

        if (isOwnMessage || isTargetUserMessage) {
          set({ activeChat: { ...currentActive, id: conversationId } });
          get().markMessagesAsRead(conversationId);
          get().fetchMessages(conversationId);
        }
      }
    });

    // Pesan Diubah
    ws.on('message:edited', ({ conversationId, messageId, content }) => {
      set((state) => {
        const currentMessages = state.messagesByChat[conversationId] || [];

        return {
          messagesByChat: {
            ...state.messagesByChat,
            [conversationId]: currentMessages.map((msg) =>
              msg.id === messageId ? { ...msg, content: content, is_edited: true } : msg,
            ),
          },
        };
      });
    });

    // Baca pesan
    ws.on('message:read', ({ messageId, readerId, readAt }) => {
      const myUserId = useAuthStore.getState().user?.id;
      if (!myUserId) return;

      set((state) => {
        const newMessagesByChat = { ...state.messagesByChat };

        for (const [convId, messages] of Object.entries(newMessagesByChat)) {
          const msgIndex = messages.findIndex((m) => m.id === messageId);
          if (msgIndex !== -1) {
            const updatedMessages = [...messages];
            const msg = updatedMessages[msgIndex]!;

            // Dedup: jangan tambahkan jika readerId sudah ada
            const alreadyRead = msg.reads?.some((r) => r.user_id === readerId);
            if (alreadyRead) break;

            updatedMessages[msgIndex] = {
              ...msg,
              reads: [...(msg.reads || []), { user_id: readerId, read_at: readAt }],
            };
            newMessagesByChat[convId] = updatedMessages;
            break;
          }
        }

        return { messagesByChat: newMessagesByChat };
      });
    });

    // Pesan Dihapus
    ws.on('message:deleted', ({ messageId, conversationId }) => {
      set((state) => ({
        messagesByChat: {
          ...state.messagesByChat,
          [conversationId]: state.messagesByChat[conversationId]?.map((msg) =>
            msg.id === messageId ? { ...msg, deleted_at: new Date().toISOString() } : msg,
          ),
        },
      }));
    });

    // Event reaksi emoji dari server
    ws.on('message:react_updated', ({ messageId, conversationId, userId, reaction }) => {
      set((state) => {
        const chatMessages = state.messagesByChat[conversationId];
        if (!chatMessages) return state;

        const updatedMessages = chatMessages.map((msg) => {
          if (msg.id === messageId) {
            const existingReactions = msg.reactions || [];

            // Cek apakah user ini sudah memberi reaksi yang sama atau menggantinya
            const filteredReactions = existingReactions.filter((r) => r.user_id !== userId);

            return {
              ...msg,
              // Masukkan reaksi baru (format mengikuti type Reactions)
              reactions:
                reaction === ''
                  ? filteredReactions
                  : [...filteredReactions, { id: 'temp-' + Date.now(), user_id: userId, reaction }],
            };
          }

          return msg;
        });

        return {
          messagesByChat: {
            ...state.messagesByChat,
            [conversationId]: updatedMessages,
          },
        };
      });
    });

    // Status Online / Offline
    ws.on('user:online', ({ userId }) => {
      set((state) => ({
        onlineUsers: { ...state.onlineUsers, [userId]: true },
      }));
    });

    ws.on('user:offline', ({ userId }) => {
      set((state) => {
        const newOnlineUsers = { ...state.onlineUsers };
        delete newOnlineUsers[userId];
        return { onlineUsers: newOnlineUsers };
      });
    });

    // Indikator Mengetik (Typing)
    ws.on('typing:start', ({ conversationId, userId }) => {
      set((state) => {
        const currentlyTyping = state.typingStatus[conversationId] || [];
        if (currentlyTyping.includes(userId)) return state;

        return {
          typingStatus: {
            ...state.typingStatus,
            [conversationId]: [...currentlyTyping, userId],
          },
        };
      });
    });

    ws.on('typing:stop', ({ conversationId, userId }) => {
      set((state) => {
        const currentlyTyping = state.typingStatus[conversationId] || [];
        return {
          typingStatus: {
            ...state.typingStatus,
            [conversationId]: currentlyTyping.filter((id) => id !== userId),
          },
        };
      });
    });

    // Tangkap Update Avatar Grup
    ws.on('group:update_avatar', ({ conversationId, avatarUrl }) => {
      set((state) => {
        // A. Update Active Chat (jika sedang membuka room grup tersebut)
        const updatedActiveChat =
          state.activeChat?.id === conversationId
            ? ({ ...state.activeChat, avatar_url: avatarUrl } as Conversation)
            : state.activeChat;

        // B. Update list obrolan (agar foto di list grup berubah instan)
        const updatedConversations = state.conversations?.map((c) =>
          c.id === conversationId ? ({ ...c, avatar_url: avatarUrl } as Conversation) : c,
        );

        return {
          activeChat: updatedActiveChat,
          conversations: updatedConversations,
        };
      });
    });

    // Tangkap Update Info Grup (Nama & Deskripsi)
    ws.on('group:update_info', ({ conversationId, name, description }) => {
      set((state) => {
        // A. Update Active Chat
        const updatedActiveChat =
          state.activeChat?.id === conversationId
            ? ({
                ...state.activeChat,
                name: name !== null ? name : state.activeChat.name,
                description: description !== null ? description : state.activeChat.description,
              } as Conversation)
            : state.activeChat;

        // B. Update List Obrolan
        const updatedConversations = state.conversations?.map((c) =>
          c.id === conversationId
            ? ({
                ...c,
                name: name !== null ? name : c.name,
                description: description !== null ? description : c.description,
              } as Conversation)
            : c,
        );

        return {
          activeChat: updatedActiveChat,
          conversations: updatedConversations,
        };
      });
    });

    // Member baru masuk
    ws.on('group:member_added', async ({ conversationId }) => {
      // Clear cache dulu agar fetchParticipants tidak skip
      set((state) => ({
        participantsByChat: {
          ...state.participantsByChat,
          [conversationId]: [],
        },
      }));

      await get().fetchParticipants(conversationId);
    });

    // Member di keluarkan
    ws.on('group:member_removed', ({ conversationId, removedMemberId }) => {
      // Ambil ID user kita sendiri (sesuaikan dengan cara Anda menyimpan auth state)
      const myUserId = useAuthStore.getState().user?.id;

      if (myUserId === removedMemberId) {
        // User saat ini yang di keluarkan
        set((state) => {
          // Jika user saat ini sedang membuka room grup tersebut, tendang ke luar!
          if (state.activeChat?.id === conversationId) {
            window.location.href = '/group'; // Force redirect ke list grup
            return { activeChat: null };
          }
          return state;
        });
      } else {
        // Orang lain yang di keluarkan
        set((state) => ({
          participantsByChat: {
            ...state.participantsByChat,
            [conversationId]:
              state.participantsByChat[conversationId]?.filter(
                (p) => p.user_id !== removedMemberId,
              ) || [],
          },
        }));
      }
    });

    // Member keluar sendiri
    ws.on('group:member_left', async ({ conversationId, userId }) => {
      // Hapus orang tersebut dari daftar partisipan di UI
      set((state) => ({
        participantsByChat: {
          ...state.participantsByChat,
          [conversationId]:
            state.participantsByChat[conversationId]?.filter((p) => p.user_id !== userId) || [],
        },
      }));
    });

    // Grup dibubarkan (HARD DELETE)
    ws.on('group:deleted', ({ conversationId }) => {
      set((state) => {
        // Tendang ke halaman depan jika sedang membuka grupnya
        if (state.activeChat?.id === conversationId) {
          window.location.href = '/group';
        }

        // Bersihkan semua jejak grup ini dari memori (RAM) agar tidak bocor
        const newMessagesByChat = { ...state.messagesByChat };
        delete newMessagesByChat[conversationId];

        const newParticipantsByChat = { ...state.participantsByChat };
        delete newParticipantsByChat[conversationId];

        return {
          activeChat: state.activeChat?.id === conversationId ? null : state.activeChat,
          messagesByChat: newMessagesByChat,
          participantsByChat: newParticipantsByChat,
        };
      });
    });
  },
}));
