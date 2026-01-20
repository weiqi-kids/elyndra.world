import { ChatProvider } from '@/contexts/ChatContext';
import ChatList from '@/components/ChatList';
import ChatContent from '@/components/ChatContent';

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="flex h-full overflow-hidden">
        <ChatList />
        <ChatContent />
      </div>
    </ChatProvider>
  );
}
