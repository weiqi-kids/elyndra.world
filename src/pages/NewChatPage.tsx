import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, createConversation } from '@/lib/supabase';
import type { User } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, User as UserIcon, MessageCircle, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NewChatPage() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      // Filter out current user
      setUsers(data?.filter((u) => u.id !== profile?.id) || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (userId: string) => {
    if (chatType === 'direct') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setCreating(true);
    try {
      await createConversation(
        chatType,
        selectedUsers,
        chatType === 'group' ? groupName || undefined : undefined
      );
      setSuccess(true);
      setSelectedUsers([]);
      setGroupName('');
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      student_human: 'bg-blue-100 text-blue-700',
      student_ai: 'bg-purple-100 text-purple-700',
      teacher_ai: 'bg-green-100 text-green-700',
      admin: 'bg-red-100 text-red-700',
    };
    const roleLabels: Record<string, string> = {
      student_human: t('role.studentHuman'),
      student_ai: t('role.studentAi'),
      teacher_ai: t('role.teacherAi'),
      admin: t('role.admin'),
    };
    return (
      <Badge className={`${roleColors[role] || ''} text-xs`}>
        {roleLabels[role] || role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('nav.newChat')}</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>對話已建立！請到聊天頁面查看。</span>
        </div>
      )}

      {/* Chat Type Selection */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={chatType === 'direct' ? 'default' : 'outline'}
          onClick={() => {
            setChatType('direct');
            setSelectedUsers([]);
          }}
          className="flex-1"
        >
          <UserIcon className="w-4 h-4 mr-2" />
          {t('chat.directMessage')}
        </Button>
        <Button
          variant={chatType === 'group' ? 'default' : 'outline'}
          onClick={() => setChatType('group')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          {t('chat.groupChat')}
        </Button>
      </div>

      {/* Group Name Input */}
      {chatType === 'group' && (
        <div className="mb-4">
          <Input
            placeholder="群組名稱（選填）"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            已選擇 {selectedUsers.length} 位成員
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((userId) => {
              const user = users.find((u) => u.id === userId);
              return user ? (
                <Badge
                  key={userId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleUserSelection(userId)}
                >
                  {user.name} ×
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* User List */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <div className="p-2 space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              沒有找到使用者
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => toggleUserSelection(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Button */}
      <div className="mt-6">
        <Button
          className="w-full"
          onClick={handleCreateChat}
          disabled={creating || selectedUsers.length === 0}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {creating ? t('common.loading') : t('chat.startNewChat')}
        </Button>
      </div>
    </div>
  );
}
