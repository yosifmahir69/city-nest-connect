
import { useState, useEffect } from 'react';
import { getRoommates } from '@/lib/supabase';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export type RoommateFilters = {
  gender: string[];
  company: string[];
  officeLocation: string[];
  neighborhood: string[];
  budgetMin: number;
  budgetMax: number;
  hasCar: boolean | null;
  lifestyleTags: string[];
};

export function useRoommates(userId: string | undefined) {
  const [roommates, setRoommates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RoommateFilters>({
    gender: [],
    company: [],
    officeLocation: [],
    neighborhood: [],
    budgetMin: 500,
    budgetMax: 5000,
    hasCar: null,
    lifestyleTags: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchRoommates = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching roommates with filters:', filters);
      
      const { data, error } = await getRoommates(filters);
      
      if (error) {
        throw error;
      }
      
      console.log('Roommates data from server:', data);
      
      let filteredData = data || [];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(roommate => 
          roommate.fullName?.toLowerCase().includes(query) ||
          roommate.company?.toLowerCase().includes(query) ||
          roommate.officeLocation?.toLowerCase().includes(query)
        );
      }
      
      setRoommates(filteredData);
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
      console.log("Dashboard mounted, fetching roommates");
      fetchRoommates();
    }
  }, [userId]);
  
  useEffect(() => {
    if (userId) {
      fetchRoommates();
    }
  }, [searchQuery]);

  const handleFilterChange = (newFilters: Partial<RoommateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    fetchRoommates();
  };

  const resetFilters = () => {
    setFilters({
      gender: [],
      company: [],
      officeLocation: [],
      neighborhood: [],
      budgetMin: 500,
      budgetMax: 5000,
      hasCar: null,
      lifestyleTags: []
    });
    fetchRoommates();
  };

  return {
    roommates,
    isLoading,
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    applyFilters,
    resetFilters,
    fetchRoommates
  };
}
