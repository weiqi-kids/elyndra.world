import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export interface Message {
  id: number;
  content: string;
  time: string;
  sender: string;
  avatar: string;
  self?: boolean;
  readBy?: number;
}

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  return (
    <div
      className={`flex items-end space-x-2 ${message.self ? 'justify-end' : ''}`}
    >
      {!message.self && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.avatar} />
          <AvatarFallback>{message.sender[0]}</AvatarFallback>
        </Avatar>
      )}
      <div className={`${message.self ? 'items-end' : ''} flex flex-col max-w-md`}>
        {message.sender && !message.self && (
          <span className="text-xs text-gray-500">{message.sender}</span>
        )}
        <Card className="p-2 bg-muted">
          <p>{message.content}</p>
        </Card>
        <div className="text-xs text-gray-400 self-end flex space-x-1">
          <span>{message.time}</span>
          {typeof message.readBy === 'number' && (
            <span className="ml-1">✓ {message.readBy}</span>
          )}
        </div>
      </div>
      {message.self && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.avatar} />
          <AvatarFallback>{message.sender[0]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
