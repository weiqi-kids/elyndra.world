import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Users, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimeAgo } from '@/contexts/I18nContext';
import type { ConversationWithDetails } from '@/types/database';

export default function ChatList() {
  const { conversations, currentConversation, setCurrentConversation, loading } = useChat();
  const { profile } = useAuth();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = getConversationName(conv);
    return name.toLowerCase().includes(query);
  });

  function getConversationName(conversation: ConversationWithDetails): string {
    if (conversation.name) return conversation.name;

    // For direct messages, show the other user's name
    if (conversation.type === 'direct') {
      const otherMember = conversation.members?.find((m) => m.user_id !== profile?.id);
      return otherMember?.user?.name || t('chat.directMessage');
    }

    // For groups, show member names
    const memberNames = conversation.members
      ?.filter((m) => m.user_id !== profile?.id)
      .map((m) => m.user?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

    return memberNames || t('chat.groupChat');
  }

  function getConversationAvatar(conversation: ConversationWithDetails): string | undefined {
    if (conversation.type === 'direct') {
      const otherMember = conversation.members?.find((m) => m.user_id !== profile?.id);
      return otherMember?.user?.avatar_url || undefined;
    }
    return undefined;
  }

  function getLastMessage(conversation: ConversationWithDetails): string {
    // This would come from the API in a real implementation
    return '';
  }

  if (loading) {
    return (
      <div className="w-72 border-r h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-72 border-r h-full flex flex-col">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-lg mb-2">{t('chat.conversations')}</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('chat.searchConversations')}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>{t('chat.noConversations')}</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <Card
                key={conv.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  currentConversation?.id === conv.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setCurrentConversation(conv)}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={getConversationAvatar(conv)} />
                    <AvatarFallback>
                      {conv.type === 'group' ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        getConversationName(conv).charAt(0).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium truncate">{getConversationName(conv)}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimeAgo(new Date(conv.updated_at), t)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {conv.type === 'group' && (
                        <Badge variant="outline" className="text-xs py-0">
                          <Users className="w-3 h-3 mr-1" />
                          {conv.members?.length || 0}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
