import React from 'react';
import ChatList from '@/components/ChatList';
import ChatContent from '@/components/ChatContent';

const ChatPage: React.FC = () => (
  <div className="flex h-full overflow-hidden">
    <ChatList />
    <ChatContent />
  </div>
);

export default ChatPage;
