
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Message, Conversation } from '@/types';
import MessageGroup from './MessageGroup';

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  isSending,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    await onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };
  
  const dateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center gap-3">
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
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groupMessagesByDate(messages).map((group, groupIndex) => (
          <MessageGroup
            key={groupIndex}
            date={group.date}
            displayDate={dateDisplay(group.date)}
            messages={group.messages}
            currentUserId={currentUserId}
            otherUserName={conversation.otherUser.fullName}
            otherUserImage={conversation.otherUser.profileImage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Send
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
