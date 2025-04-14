import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Send } from 'lucide-react';
import { getConversations, getMessages, markMessagesAsRead, sendMessage } from '@/lib/supabase';
import { Conversation, Message, User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { format, isToday, isYesterday } from 'date-fns';

const Messaging = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await getConversations(user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setConversations(data as Conversation[]);
          
          if (data.length > 0 && !selectedConversation) {
            setSelectedConversation(data[0] as Conversation);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
    
    const intervalId = setInterval(fetchConversations, 30000);
    
    return () => clearInterval(intervalId);
  }, [user, toast, selectedConversation]);
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      try {
        const { data, error } = await getMessages(selectedConversation.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setMessages(data as Message[]);
          
          if (user) {
            await markMessagesAsRead(selectedConversation.id, user.id);
          }
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
    
    const intervalId = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [selectedConversation, user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!user) {
    navigate('/');
    return null;
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    try {
      setIsSending(true);
      
      const { error } = await sendMessage(
        selectedConversation.id,
        user.id,
        selectedConversation.otherUser.id,
        newMessage.trim()
      );
      
      if (error) {
        throw error;
      }
      
      setNewMessage('');
      
      const { data } = await getMessages(selectedConversation.id);
      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
    <div className="flex min-h-screen bg-gray-50">
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
      
      <div className="hidden sm:flex flex-col flex-1 bg-gray-50">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center gap-3">
              <Avatar>
                <AvatarImage 
                  src={selectedConversation.otherUser.profileImage} 
                  alt={selectedConversation.otherUser.fullName} 
                />
                <AvatarFallback>{selectedConversation.otherUser.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">{selectedConversation.otherUser.fullName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{selectedConversation.otherUser.company}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedConversation.otherUser.jobType}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {groupMessagesByDate(messages).map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <div className="flex justify-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {dateDisplay(group.date)}
                    </span>
                  </div>
                  
                  {group.messages.map((message) => {
                    const isCurrentUser = message.senderId === user?.id;
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                            <AvatarImage 
                              src={selectedConversation.otherUser.profileImage} 
                              alt={selectedConversation.otherUser.fullName} 
                            />
                            <AvatarFallback>{selectedConversation.otherUser.fullName.charAt(0)}</AvatarFallback>
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">Select a conversation</h2>
              <p className="text-gray-500 max-w-md">
                Choose a conversation from the sidebar or start messaging potential roommates from the dashboard.
              </p>
              {conversations.length === 0 && (
                <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                  Find Roommates
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedConversation && (
        <div className="fixed inset-0 bg-white z-50 sm:hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1"
              onClick={() => setSelectedConversation(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
            
            <Avatar>
              <AvatarImage 
                src={selectedConversation.otherUser.profileImage} 
                alt={selectedConversation.otherUser.fullName} 
              />
              <AvatarFallback>{selectedConversation.otherUser.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{selectedConversation.otherUser.fullName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{selectedConversation.otherUser.company}</span>
                <span>•</span>
                <span className="capitalize">{selectedConversation.otherUser.jobType}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {groupMessagesByDate(messages).map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {dateDisplay(group.date)}
                  </span>
                </div>
                
                {group.messages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                          <AvatarImage 
                            src={selectedConversation.otherUser.profileImage} 
                            alt={selectedConversation.otherUser.fullName} 
                          />
                          <AvatarFallback>{selectedConversation.otherUser.fullName.charAt(0)}</AvatarFallback>
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
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;
