-- Magic Campus Chat Database Schema
-- Run this in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- Custom Types (Enums)
-- =====================

-- 角色系統：學生(真人/AI)、老師(AI)、管理員
CREATE TYPE user_role AS ENUM ('student_human', 'student_ai', 'teacher_ai', 'admin');
CREATE TYPE conversation_type AS ENUM ('direct', 'group');
CREATE TYPE attachment_type AS ENUM ('image', 'file');

-- =====================
-- Core Tables
-- =====================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'student_human',
  locale TEXT DEFAULT 'zh-TW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type conversation_type DEFAULT 'direct',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation members (junction table)
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reads (已讀回條)
CREATE TABLE public.message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Attachments (圖片/檔案)
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  type attachment_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Announcements System
-- =====================

-- Tags table (標籤)
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement tags (junction table)
CREATE TABLE public.announcement_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(announcement_id, tag_id)
);

-- =====================
-- Indexes
-- =====================

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_content_search ON public.messages USING gin(to_tsvector('simple', content));
CREATE INDEX idx_conversation_members_user_id ON public.conversation_members(user_id);
CREATE INDEX idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_is_pinned ON public.announcements(is_pinned DESC, created_at DESC);
CREATE INDEX idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON public.message_reads(user_id);
CREATE INDEX idx_attachments_message_id ON public.attachments(message_id);
CREATE INDEX idx_announcement_tags_announcement_id ON public.announcement_tags(announcement_id);
CREATE INDEX idx_announcement_tags_tag_id ON public.announcement_tags(tag_id);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_tags ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS Policies
-- =====================

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

-- Conversation members policies
CREATE POLICY "Users can view conversation members" ON public.conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations" ON public.conversation_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their membership" ON public.conversation_members
  FOR UPDATE USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Message reads policies
CREATE POLICY "Users can view read receipts in their conversations" ON public.message_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = message_reads.message_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read" ON public.message_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Attachments policies
CREATE POLICY "Users can view attachments in their conversations" ON public.attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = attachments.message_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload attachments" ON public.attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = attachments.message_id AND m.sender_id = auth.uid()
    )
  );

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Announcements policies
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "Admins can create announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update announcements" ON public.announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete announcements" ON public.announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Announcement tags policies
CREATE POLICY "Announcement tags are viewable by everyone" ON public.announcement_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage announcement tags" ON public.announcement_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================
-- Functions & Triggers
-- =====================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Handle new user signup (Google/Line OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, locale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'zh-TW')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Search messages function (訊息搜尋)
CREATE OR REPLACE FUNCTION search_messages(
  search_query TEXT,
  conversation_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.created_at,
    ts_rank(to_tsvector('simple', m.content), plainto_tsquery('simple', search_query)) AS rank
  FROM public.messages m
  JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
  WHERE cm.user_id = auth.uid()
    AND to_tsvector('simple', m.content) @@ plainto_tsquery('simple', search_query)
    AND (conversation_filter IS NULL OR m.conversation_id = conversation_filter)
  ORDER BY rank DESC, m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread count for conversation
CREATE OR REPLACE FUNCTION get_unread_count(conv_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread
  FROM public.messages m
  LEFT JOIN public.message_reads mr ON mr.message_id = m.id AND mr.user_id = auth.uid()
  WHERE m.conversation_id = conv_id
    AND m.sender_id != auth.uid()
    AND mr.id IS NULL;
  RETURN unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- Enable Realtime
-- =====================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- =====================
-- Storage Buckets (run separately in Supabase dashboard)
-- =====================
-- 1. Create bucket: 'avatars' (public)
-- 2. Create bucket: 'attachments' (authenticated access)
--
-- Storage policies will be configured in Supabase dashboard

-- =====================
-- Initial Data (Optional)
-- =====================

-- Insert default tags
INSERT INTO public.tags (name, color) VALUES
  ('重要', '#EF4444'),
  ('活動', '#F59E0B'),
  ('課程', '#10B981'),
  ('行政', '#6366F1'),
  ('其他', '#6B7280')
ON CONFLICT (name) DO NOTHING;
