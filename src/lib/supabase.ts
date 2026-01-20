import { createClient } from '@supabase/supabase-js';
import type { Database, Message, Attachment } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock mode.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// =====================
// Conversations API
// =====================

export async function getConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      members:conversation_members(
        *,
        user:users(*)
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getConversation(id: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      members:conversation_members(
        *,
        user:users(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createConversation(
  type: 'direct' | 'group',
  memberIds: string[],
  name?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      type,
      name,
      created_by: user.id,
    })
    .select()
    .single();

  if (convError) throw convError;

  // Add members (including creator)
  const allMemberIds = [...new Set([user.id, ...memberIds])];
  const members = allMemberIds.map((userId) => ({
    conversation_id: conversation.id,
    user_id: userId,
  }));

  const { error: memberError } = await supabase
    .from('conversation_members')
    .insert(members);

  if (memberError) throw memberError;

  return conversation;
}

// =====================
// Messages API
// =====================

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users(*),
      attachments(*),
      read_by:message_reads(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data?.reverse() ?? [];
}

export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: { type: 'image' | 'file'; file: File }[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert message
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    .select()
    .single();

  if (msgError) throw msgError;

  // Upload attachments if any
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      const filePath = `${conversationId}/${message.id}/${attachment.file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, attachment.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      await supabase.from('attachments').insert({
        message_id: message.id,
        type: attachment.type,
        file_name: attachment.file.name,
        file_url: publicUrl,
        file_size: attachment.file.size,
        mime_type: attachment.file.type,
      });
    }
  }

  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return message;
}

export async function searchMessages(query: string, conversationId?: string) {
  const { data, error } = await supabase.rpc('search_messages', {
    search_query: query,
    conversation_filter: conversationId || null,
  });

  if (error) throw error;
  return data;
}

// =====================
// Read Receipts API
// =====================

export async function markMessagesAsRead(messageIds: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const reads = messageIds.map((messageId) => ({
    message_id: messageId,
    user_id: user.id,
  }));

  const { error } = await supabase
    .from('message_reads')
    .upsert(reads, { onConflict: 'message_id,user_id' });

  if (error) throw error;
}

export async function getUnreadCount(conversationId: string) {
  const { data, error } = await supabase.rpc('get_unread_count', {
    conv_id: conversationId,
  });

  if (error) throw error;
  return data ?? 0;
}

// =====================
// Realtime Subscriptions
// =====================

export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();
}

export function subscribeToReadReceipts(
  conversationId: string,
  callback: (read: { message_id: string; user_id: string }) => void
) {
  return supabase
    .channel(`reads:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'message_reads',
      },
      (payload) => callback(payload.new as { message_id: string; user_id: string })
    )
    .subscribe();
}

// =====================
// Announcements API
// =====================

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:users(*),
      announcement_tags(
        tag:tags(*)
      )
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform data to include tags array
  return data?.map((announcement) => ({
    ...announcement,
    tags: announcement.announcement_tags?.map((at: any) => at.tag) ?? [],
  }));
}

export async function createAnnouncement(
  title: string,
  content: string,
  tagIds: string[],
  isPinned = false
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: announcement, error: annError } = await supabase
    .from('announcements')
    .insert({
      title,
      content,
      author_id: user.id,
      is_pinned: isPinned,
    })
    .select()
    .single();

  if (annError) throw annError;

  // Add tags
  if (tagIds.length > 0) {
    const announcementTags = tagIds.map((tagId) => ({
      announcement_id: announcement.id,
      tag_id: tagId,
    }));

    await supabase.from('announcement_tags').insert(announcementTags);
  }

  return announcement;
}

export async function updateAnnouncement(
  id: string,
  updates: { title?: string; content?: string; is_pinned?: boolean; tagIds?: string[] }
) {
  const { tagIds, ...announcementUpdates } = updates;

  if (Object.keys(announcementUpdates).length > 0) {
    const { error } = await supabase
      .from('announcements')
      .update(announcementUpdates)
      .eq('id', id);

    if (error) throw error;
  }

  if (tagIds !== undefined) {
    // Remove existing tags
    await supabase.from('announcement_tags').delete().eq('announcement_id', id);

    // Add new tags
    if (tagIds.length > 0) {
      const announcementTags = tagIds.map((tagId) => ({
        announcement_id: id,
        tag_id: tagId,
      }));
      await supabase.from('announcement_tags').insert(announcementTags);
    }
  }
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}

export async function getTags() {
  const { data, error } = await supabase.from('tags').select('*');
  if (error) throw error;
  return data;
}

// =====================
// Users API
// =====================

export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string; role?: string; locale?: string }
) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, file: File) {
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update user profile with new avatar URL
  await updateUserProfile(userId, { avatar_url: publicUrl });

  return publicUrl;
}
