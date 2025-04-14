
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import ConversationList from '@/components/messaging/ConversationList';
import ChatArea from '@/components/messaging/ChatArea';
import MobileChatView from '@/components/messaging/MobileChatView';

const Messaging = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    isLoading,
    conversations,
    selectedConversation,
    setSelectedConversation
  } = useConversations(user?.id);
  
  const {
    messages,
    isSending,
    sendMessage
  } = useMessages(selectedConversation, user?.id);
  
  if (!user) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
      />
      
      <div className="hidden sm:flex flex-1">
        {selectedConversation ? (
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user.id}
            onSendMessage={sendMessage}
            isSending={isSending}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">Select a conversation</h2>
              <p className="text-gray-500 max-w-md">
                Choose a conversation from the sidebar or start messaging potential roommates from the dashboard.
              </p>
              {conversations.length === 0 && (
                <button 
                  className="mt-4 px-4 py-2 bg-roommate-blue text-white rounded-md"
                  onClick={() => navigate('/dashboard')}
                >
                  Find Roommates
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedConversation && (
        <MobileChatView
          conversation={selectedConversation}
          messages={messages}
          currentUserId={user.id}
          onSendMessage={sendMessage}
          isSending={isSending}
          onBack={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
};

export default Messaging;
