
import { useState, useEffect } from 'react';
import { getRoommates } from '@/lib/supabase';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useRoommates(userId: string | undefined) {
  const [roommates, setRoommates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoommates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getRoommates();
      
      if (error) {
        throw error;
      }
      
      setRoommates(data || []);
    } catch (error: any) {
      console.error('Error fetching roommates:', error);
      toast({
        title: "Error",
        description: "Failed to load roommates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRoommates();
    }
  }, [userId]);

  return {
    roommates,
    isLoading,
    fetchRoommates
  };
}
