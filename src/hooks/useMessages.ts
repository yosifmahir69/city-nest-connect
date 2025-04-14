
import { useState, useEffect } from 'react';
import { getMessages, markMessagesAsRead, sendMessage } from '@/lib/supabase';
import { Message, Conversation } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useMessages(conversation: Conversation | null, userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!conversation || !userId) return;
    
    try {
      const { data, error } = await getMessages(conversation.id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setMessages(data as Message[]);
        await markMessagesAsRead(conversation.id, userId);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [conversation, userId]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversation || !userId) return;
    
    try {
      setIsSending(true);
      
      const { error } = await sendMessage(
        conversation.id,
        userId,
        conversation.otherUser.id,
        content.trim()
      );
      
      if (error) {
        throw error;
      }
      
      await fetchMessages();
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

  return {
    messages,
    isSending,
    sendMessage: handleSendMessage
  };
}
