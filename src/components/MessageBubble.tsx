import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck, FileIcon, Download } from 'lucide-react';
import type { Attachment } from '@/types/database';

export interface Message {
  id: string | number;
  content: string;
  time: string;
  sender: string;
  avatar?: string;
  self?: boolean;
  readBy?: number;
  attachments?: Attachment[];
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { content, time, sender, avatar, self, readBy, attachments } = message;

  return (
    <div className={`flex items-end gap-2 ${self ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs">
          {sender.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[70%] ${self ? 'items-end' : 'items-start'} flex flex-col`}>
        {!self && (
          <span className="text-xs text-gray-500 mb-1 px-1">{sender}</span>
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${
            self
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          {content && <p className="whitespace-pre-wrap break-words">{content}</p>}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type === 'image' ? (
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={attachment.file_url}
                        alt={attachment.file_name}
                        className="max-w-full rounded-lg max-h-60 object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        self ? 'bg-blue-400' : 'bg-gray-200'
                      }`}
                    >
                      <FileIcon className="w-5 h-5" />
                      <span className="text-sm truncate flex-1">
                        {attachment.file_name}
                      </span>
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1 mt-1 px-1 text-xs text-gray-500 ${
            self ? 'flex-row-reverse' : ''
          }`}
        >
          <span>{time}</span>
          {self && (
            <span className="flex items-center">
              {readBy && readBy > 0 ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
