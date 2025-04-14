
import { useState, useEffect } from 'react';
import { getConversations } from '@/lib/supabase';
import { Conversation } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useConversations(userId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();

  const fetchConversations = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getConversations(userId);
      
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

  useEffect(() => {
    fetchConversations();
    
    const intervalId = setInterval(fetchConversations, 30000);
    return () => clearInterval(intervalId);
  }, [userId]);

  return {
    isLoading,
    conversations,
    selectedConversation,
    setSelectedConversation,
    fetchConversations
  };
}
