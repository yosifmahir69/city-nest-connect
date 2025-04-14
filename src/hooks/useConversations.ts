
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getConversations } from '@/lib/supabase';
import { Conversation } from '@/types';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getConversations(user.id);
      
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
  }, [user]);

  return { conversations, loading, error, refetch: fetchConversations };
}
