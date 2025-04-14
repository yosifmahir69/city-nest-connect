
import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { Message, Conversation } from '@/types';
import { ChevronLeft } from 'lucide-react';
import ChatArea from './ChatArea';

interface MobileChatViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  onBack: () => void;
}

const MobileChatView: React.FC<MobileChatViewProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  isSending,
  onBack,
}) => {
  return (
    <div className="fixed inset-0 bg-white z-50 sm:hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Avatar>
          <AvatarImage 
            src={conversation.otherUser.profileImage} 
            alt={conversation.otherUser.fullName} 
          />
          <AvatarFallback>{conversation.otherUser.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{conversation.otherUser.fullName}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{conversation.otherUser.company}</span>
            <span>•</span>
            <span className="capitalize">{conversation.otherUser.jobType}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <ChatArea
          conversation={conversation}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={onSendMessage}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default MobileChatView;
