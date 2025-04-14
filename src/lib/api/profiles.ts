import { supabase } from '@/integrations/supabase/client';
import { transformProfile } from '../data-transformers';
import { User } from '@/types';
import { ProfileRow } from '../db-types';

// Profile related functions
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
    
    return { data: transformProfile(data as ProfileRow), error: null };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error };
  }
}

export async function createUserProfile(userId: string, profileData: Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData,
        },
      ]);
    
    if (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { data: null, error };
  }
}

export async function getRoommates() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Transform into User objects
    const users = data.map(profile => transformProfile(profile));
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Error fetching roommates:', error);
    return { data: [], error };
  }
}

// Function to get all users
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Transform into User objects
    const users = data.map(profile => transformProfile(profile));
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { data: [], error };
  }
}
