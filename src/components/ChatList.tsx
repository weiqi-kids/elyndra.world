import React from 'react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Conversation {
  id: number;
  title: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

const base = import.meta.env.BASE_URL;
const mockConversations: Conversation[] = [
  {
    id: 1,
    title: 'Magic Club',
    lastMessage: 'Hey everyone, meeting today at 5PM in the main hall.',
    time: '10:24',
    unread: 3,
    avatar: `${base}avatars/user1.png`,
  },
  {
    id: 2,
    title: 'Professor Oak',
    lastMessage: 'Please submit your assignments before Friday. Long message example to show truncation in the list.',
    time: '09:10',
    unread: 0,
    avatar: `${base}avatars/user2.png`,
  },
];

const ChatList: React.FC = () => {
  return (
    <div className="w-72 border-r h-full flex flex-col">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {mockConversations.map((conv) => (
            <Card key={conv.id} className="p-2 flex items-start space-x-2">
              <Avatar>
                <AvatarImage src={conv.avatar} />
                <AvatarFallback>{conv.title[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium truncate">{conv.title}</span>
                  <span className="text-xs text-gray-500">{conv.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-[20px] justify-center">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
