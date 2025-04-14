
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search } from 'lucide-react';
import { Conversation } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  searchQuery,
  setSearchQuery,
  isLoading,
}) => {
  const navigate = useNavigate();

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full sm:w-80 md:w-96 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-roommate-blue" />
        </div>
      ) : filteredConversations.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-roommate-paleBlue' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage 
                    src={conversation.otherUser.profileImage} 
                    alt={conversation.otherUser.fullName} 
                  />
                  <AvatarFallback>{conversation.otherUser.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{conversation.otherUser.fullName}</h3>
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessageContent}</p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {conversation.otherUser.company}
                    </Badge>
                    <Badge variant={conversation.otherUser.jobType === 'internship' ? 'outline' : 'secondary'} className="text-xs">
                      {conversation.otherUser.jobType === 'internship' ? 'Intern' : 'Full-time'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No conversations found</p>
          <p className="text-sm text-gray-400 mt-1">
            Start messaging potential roommates from the dashboard
          </p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Find Roommates
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
