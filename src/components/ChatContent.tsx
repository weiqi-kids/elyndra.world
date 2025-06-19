import React, { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import MessageInput from './MessageInput';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const mockMessages: Message[] = [
  {
    id: 1,
    content: 'Hi there! Welcome to the Magic Campus.',
    time: '09:00',
    sender: 'Professor Oak',
    avatar: 'https://placekitten.com/50/50',
  },
  {
    id: 2,
    content: 'Thank you professor!',
    time: '09:02',
    sender: 'You',
    avatar: 'https://placekitten.com/52/52',
    self: true,
    readBy: 3,
  },
];

const ChatContent: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages" className="pl-8" />
        </div>
      </div>
      <ScrollArea ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mockMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </ScrollArea>
      <MessageInput />
    </div>
  );
};

export default ChatContent;
