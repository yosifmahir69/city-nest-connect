
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Message } from '@/types';

interface MessageGroupProps {
  date: string;
  displayDate: string;
  messages: Message[];
  currentUserId: string;
  otherUserName: string;
  otherUserImage?: string;
}

const MessageGroup: React.FC<MessageGroupProps> = ({
  date,
  displayDate,
  messages,
  currentUserId,
  otherUserName,
  otherUserImage,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {displayDate}
        </span>
      </div>
      
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isCurrentUser && (
              <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                <AvatarImage 
                  src={otherUserImage} 
                  alt={otherUserName} 
                />
                <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            
            <div 
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                isCurrentUser 
                  ? 'bg-roommate-blue text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} block mt-1`}>
                {format(new Date(message.createdAt), 'h:mm a')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageGroup;
