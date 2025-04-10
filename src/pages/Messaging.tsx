
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, Message, User } from '@/types';
import { getConversations, getMessages, sendMessage } from '@/lib/supabase';
import { format } from 'date-fns';
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Sample data until Supabase integration
const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participantIds: ['current-user', '1'],
    lastMessageId: 'm4',
    lastMessageContent: 'Are you still looking for a roommate?',
    lastMessageTime: '2025-04-09T14:30:00Z',
    unreadCount: 1,
    otherUser: {
      id: '1',
      email: 'alex@example.com',
      fullName: 'Alex Johnson',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      jobType: 'internship',
      company: 'Google',
      officeLocation: 'Google – NYC 111 8th Ave',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      gender: 'male',
      preferredRoommateGenders: ['male', 'female'],
      hasCar: true,
      preferredNeighborhoods: ['Chelsea', 'West Village'],
      budgetMin: 1200,
      budgetMax: 2000,
      lifestyleTags: ['Gym enthusiast', 'Early bird', 'Tech', 'Clean'],
      firstTimeInCity: true,
      additionalPreferences: ['Private bathroom', 'In-unit laundry'],
      createdAt: '2025-04-01',
      updatedAt: '2025-04-01'
    }
  },
  {
    id: '2',
    participantIds: ['current-user', '2'],
    lastMessageId: 'm8',
    lastMessageContent: 'I found a nice apartment in Midtown we could check out.',
    lastMessageTime: '2025-04-08T18:15:00Z',
    unreadCount: 0,
    otherUser: {
      id: '2',
      email: 'maya@example.com',
      fullName: 'Maya Rodriguez',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      jobType: 'fulltime',
      company: 'Amazon',
      officeLocation: 'Amazon – NYC 7 W 34th St',
      startDate: '2025-07-15',
      gender: 'female',
      preferredRoommateGenders: ['female'],
      hasCar: false,
      preferredNeighborhoods: ['Midtown', 'Upper East Side'],
      budgetMin: 1500,
      budgetMax: 2500,
      lifestyleTags: ['Social', 'Music', 'Travel', 'Non-smoker'],
      firstTimeInCity: false,
      additionalPreferences: ['Near subway', 'Pet-friendly building'],
      createdAt: '2025-04-02',
      updatedAt: '2025-04-02'
    }
  }
];

const SAMPLE_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      senderId: 'current-user',
      receiverId: '1',
      content: 'Hi Alex, I noticed we both work at tech companies and are looking for places in the same neighborhoods.',
      read: true,
      createdAt: '2025-04-09T10:15:00Z'
    },
    {
      id: 'm2',
      senderId: '1',
      receiverId: 'current-user',
      content: 'Hey! Yeah, I saw that too. I think we might be a good match as roommates.',
      read: true,
      createdAt: '2025-04-09T10:20:00Z'
    },
    {
      id: 'm3',
      senderId: 'current-user',
      receiverId: '1',
      content: 'What kind of place are you looking for? I was thinking a 2-bedroom in Chelsea.',
      read: true,
      createdAt: '2025-04-09T10:25:00Z'
    },
    {
      id: 'm4',
      senderId: '1',
      receiverId: 'current-user',
      content: 'Are you still looking for a roommate?',
      read: false,
      createdAt: '2025-04-09T14:30:00Z'
    }
  ],
  '2': [
    {
      id: 'm5',
      senderId: 'current-user',
      receiverId: '2',
      content: 'Hi Maya, I see you're looking for a place in Midtown. That's where I'm looking too!',
      read: true,
      createdAt: '2025-04-08T14:30:00Z'
    },
    {
      id: 'm6',
      senderId: '2',
      receiverId: 'current-user',
      content: 'Hi there! Yes, I'd love to find a place close to work. Have you found any good listings?',
      read: true,
      createdAt: '2025-04-08T15:45:00Z'
    },
    {
      id: 'm7',
      senderId: 'current-user',
      receiverId: '2',
      content: 'I've been looking at a few buildings on StreetEasy. Would you be interested in trying to see some places together?',
      read: true,
      createdAt: '2025-04-08T16:30:00Z'
    },
    {
      id: 'm8',
      senderId: '2',
      receiverId: 'current-user',
      content: 'I found a nice apartment in Midtown we could check out.',
      read: true,
      createdAt: '2025-04-08T18:15:00Z'
    }
  ]
};

const Messaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch conversations
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await getConversations(user.id);
        
        if (error) {
          throw error;
        }
        
        // For now, use sample data
        setConversations(SAMPLE_CONVERSATIONS);
        
        // Set first conversation as active if there isn't one
        if (SAMPLE_CONVERSATIONS.length > 0 && !activeConversation) {
          setActiveConversation(SAMPLE_CONVERSATIONS[0]);
          fetchMessages(SAMPLE_CONVERSATIONS[0].id);
        }
      } catch (error: any) {
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
  }, [user]);

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getMessages(conversationId);
      
      if (error) {
        throw error;
      }
      
      // For now, use sample data
      setMessages(SAMPLE_MESSAGES[conversationId] || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim()) return;
    
    try {
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        senderId: 'current-user',
        receiverId: activeConversation.otherUser.id,
        content: newMessage,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Optimistically update UI
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      scrollToBottom();
      
      const { data, error } = await sendMessage(
        'current-user',
        activeConversation.otherUser.id,
        newMessage
      );
      
      if (error) {
        throw error;
      }
      
      // Update conversations with latest message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id 
            ? {
                ...conv,
                lastMessageId: tempId,
                lastMessageContent: newMessage,
                lastMessageTime: new Date().toISOString()
              }
            : conv
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
    
    // Mark conversation as read when selected
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Inbox/Conversation List */}
      <div className="w-80 border-r border-gray-200 bg-white hidden md:block overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)] p-2">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  activeConversation?.id === conversation.id
                    ? 'bg-roommate-paleBlue'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.otherUser.profileImage} alt={conversation.otherUser.fullName} />
                    <AvatarFallback>
                      {conversation.otherUser.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{conversation.otherUser.fullName}</h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessageContent}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {conversation.otherUser.company}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-roommate-blue text-white text-xs rounded-full px-2 py-0.5">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No messages yet</p>
              <p className="text-sm">
                Go to the dashboard to find roommates and start chatting
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Message Thread */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConversation.otherUser.profileImage} alt={activeConversation.otherUser.fullName} />
                <AvatarFallback>
                  {activeConversation.otherUser.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">{activeConversation.otherUser.fullName}</h2>
                <p className="text-sm text-gray-600">
                  {activeConversation.otherUser.company} • {activeConversation.otherUser.jobType === 'internship' ? 'Intern' : 'Full-time'}
                </p>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isSender = message.senderId === 'current-user';
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                  
                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[75%] px-4 py-2 rounded-lg ${
                            isSender 
                              ? 'bg-roommate-blue text-white rounded-br-none' 
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          <span 
                            className={`text-xs ${isSender ? 'text-blue-100' : 'text-gray-500'} block text-right mt-1`}
                          >
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">No Conversation Selected</h2>
            <p className="text-gray-600 max-w-md">
              Select a conversation from the list on the left to view your messages, or start a new conversation from the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
