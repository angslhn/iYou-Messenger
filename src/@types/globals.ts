export type UserData = {
  id: string;
  fullname: string | null;
  username: string;
  email: string;
  pin: string | null;
  phone: string | null;
  about: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
  hide_profile: boolean;
  read_receipt: boolean;
  story_receipt: boolean;
  show_last_seen: boolean;
  created_at: string;
};

export type Field = 'fullname' | 'username' | 'email' | 'password' | 'identifier';

export type Form = Record<Field, string>;

export type Conversation = {
  id: string;
  type: 'private' | 'group';
  name: string | null;
  avatar_url: string | null;
  description: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  is_muted: boolean;
  role: 'peer' | 'admin' | 'member';
  participant_id?: string;
  target_user_id?: string | null;
  is_online?: boolean;
  last_seen?: string | null;
  created_at: string;
  last_cleared_at: string | null;
  unread_count: number;
  last_message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  reply_to_message_id?: string | null;
  is_edited?: boolean;
  deleted_at?: string | null;
  reads?: { user_id: string; read_at: string }[];
  reactions?: {
    id: string;
    user_id: string;
    reaction: string;
  }[];
};

export type ConversationResponse = {
  conversations: Conversation[];
  meta: Record<'totalCount' | 'pinnedCount' | 'archivedCount', number>;
};
