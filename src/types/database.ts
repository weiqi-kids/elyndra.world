export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student_human' | 'student_ai' | 'teacher_ai' | 'admin';
export type ConversationType = 'direct' | 'group';
export type AttachmentType = 'image' | 'file';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          role: UserRole;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          role?: UserRole;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          name: string | null;
          type: ConversationType;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          type?: ConversationType;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          type?: ConversationType;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_members: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          joined_at?: string;
          last_read_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string | null;
          content?: string;
          created_at?: string;
        };
      };
      message_reads: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          read_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          read_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          message_id: string;
          type: AttachmentType;
          file_name: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          type: AttachmentType;
          file_name: string;
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          type?: AttachmentType;
          file_name?: string;
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string | null;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcement_tags: {
        Row: {
          id: string;
          announcement_id: string;
          tag_id: string;
        };
        Insert: {
          id?: string;
          announcement_id: string;
          tag_id: string;
        };
        Update: {
          id?: string;
          announcement_id?: string;
          tag_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_messages: {
        Args: {
          search_query: string;
          conversation_filter?: string | null;
        };
        Returns: {
          id: string;
          conversation_id: string;
          sender_id: string | null;
          content: string;
          created_at: string;
          rank: number;
        }[];
      };
      get_unread_count: {
        Args: {
          conv_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      conversation_type: ConversationType;
      attachment_type: AttachmentType;
    };
  };
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationMember = Database['public']['Tables']['conversation_members']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageRead = Database['public']['Tables']['message_reads']['Row'];
export type Attachment = Database['public']['Tables']['attachments']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type AnnouncementTag = Database['public']['Tables']['announcement_tags']['Row'];

// Extended types with relations
export interface MessageWithSender extends Message {
  sender: User | null;
  attachments?: Attachment[];
  read_by?: MessageRead[];
}

export interface ConversationWithDetails extends Conversation {
  members: (ConversationMember & { user: User })[];
  last_message?: Message;
  unread_count?: number;
}

export interface AnnouncementWithDetails extends Announcement {
  author: User | null;
  tags: Tag[];
}
