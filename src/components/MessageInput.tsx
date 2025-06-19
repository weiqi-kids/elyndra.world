import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Image as ImageIcon, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MessageInput: React.FC = () => {
  return (
    <div className="border-t p-2 flex items-end space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40">Emoji picker</PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon">
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Textarea
        className="flex-1 resize-none" placeholder="Type a message" rows={1}
      />
      <Button variant="default" size="icon">
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MessageInput;
