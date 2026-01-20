import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToReadReceipts,
  searchMessages as searchMessagesApi,
  createConversation,
} from '@/lib/supabase';
import type { Message, User, ConversationWithDetails, MessageWithSender, Attachment } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface ChatContextType {
  conversations: ConversationWithDetails[];
  currentConversation: ConversationWithDetails | null;
  messages: MessageWithSender[];
  loading: boolean;
  messagesLoading: boolean;
  setCurrentConversation: (conversation: ConversationWithDetails | null) => void;
  sendMessage: (content: string, attachments?: { type: 'image' | 'file'; file: File }[]) => Promise<void>;
  searchMessages: (query: string) => Promise<MessageWithSender[]>;
  refreshConversations: () => Promise<void>;
  startNewConversation: (type: 'direct' | 'group', memberIds: string[], name?: string) => Promise<ConversationWithDetails>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Load conversations
  const refreshConversations = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getConversations();
      setConversations(data as ConversationWithDetails[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load messages for current conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await getMessages(conversationId);
      setMessages(data as MessageWithSender[]);

      // Mark messages as read
      const unreadMessageIds = data
        .filter((m: any) => m.sender_id !== user?.id && !m.read_by?.some((r: any) => r.user_id === user?.id))
        .map((m: any) => m.id);

      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setLoading(false);
    }
  }, [user, refreshConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation, loadMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentConversation) return;

    const messageChannel = subscribeToMessages(currentConversation.id, (newMessage) => {
      // Fetch full message with sender info
      supabase
        .from('messages')
        .select('*, sender:users(*), attachments(*), read_by:message_reads(*)')
        .eq('id', newMessage.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setMessages((prev) => [...prev, data as MessageWithSender]);

            // Mark as read if not from current user
            if (data.sender_id !== user?.id) {
              markMessagesAsRead([data.id]);
            }
          }
        });
    });

    const readChannel = subscribeToReadReceipts(currentConversation.id, (read) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === read.message_id
            ? {
                ...msg,
                read_by: [...(msg.read_by || []), { message_id: read.message_id, user_id: read.user_id }] as any,
              }
            : msg
        )
      );
    });

    return () => {
      messageChannel.unsubscribe();
      readChannel.unsubscribe();
    };
  }, [currentConversation, user]);

  const sendMessage = async (content: string, attachments?: { type: 'image' | 'file'; file: File }[]) => {
    if (!currentConversation || !content.trim()) return;

    try {
      await sendMessageApi(currentConversation.id, content, attachments);
      // Message will be added via realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const searchMessages = async (query: string): Promise<MessageWithSender[]> => {
    if (!query.trim()) return [];

    try {
      const results = await searchMessagesApi(query, currentConversation?.id);
      return results as MessageWithSender[];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };

  const startNewConversation = async (
    type: 'direct' | 'group',
    memberIds: string[],
    name?: string
  ): Promise<ConversationWithDetails> => {
    const conversation = await createConversation(type, memberIds, name);
    await refreshConversations();
    return conversation as ConversationWithDetails;
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    setCurrentConversation,
    sendMessage,
    searchMessages,
    refreshConversations,
    startNewConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
