import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MessageWithSender } from '@/types/database';

export default function ChatContent() {
  const { currentConversation, messages, messagesLoading, searchMessages } = useChat();
  const { profile } = useAuth();
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MessageWithSender[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && !showSearch) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showSearch]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMessages(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
        <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg">{t('chat.noConversations')}</p>
        <p className="text-sm">{t('chat.startNewChat')}</p>
      </div>
    );
  }

  const displayMessages = showSearch && searchResults.length > 0 ? searchResults : messages;

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-2">
        {showSearch ? (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('chat.searchMessages')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearSearch}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="font-semibold flex-1">{currentConversation.name || t('chat.directMessage')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {messagesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {showSearch ? t('chat.noMessages') : t('chat.noMessages')}
            </div>
          ) : (
            <div className="space-y-4">
              {displayMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={{
                    id: msg.id,
                    content: msg.content,
                    time: new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    sender: msg.sender?.name || 'Unknown',
                    avatar: msg.sender?.avatar_url || undefined,
                    self: msg.sender_id === profile?.id,
                    readBy: msg.read_by?.length || 0,
                    attachments: msg.attachments,
                  }}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      <MessageInput />
    </div>
  );
}
