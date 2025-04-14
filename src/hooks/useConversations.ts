
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getConversations } from '@/lib/supabase';
import { Conversation } from '@/types';

export function useConversations(userId?: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const fetchConversations = async () => {
    if (!user && !userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getConversations(userId || user?.id || '');
      
      if (error) {
        throw error;
      }
      
      // Ensure data is an array before accessing length
      if (data && Array.isArray(data)) {
        setConversations(data as unknown as Conversation[]);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user, userId]);

  return { 
    conversations, 
    loading, 
    error, 
    refetch: fetchConversations,
    isLoading: loading,
    selectedConversation,
    setSelectedConversation
  };
}
