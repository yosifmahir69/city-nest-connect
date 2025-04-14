
import { supabase } from '@/integrations/supabase/client';
import { RoommateFilters, RPCFunctionArgs, RPCFunctionReturns } from '../db-types';

// Roommate-related functions
export async function getRoommates(filters?: RoommateFilters) {
  try {
    const { data, error } = await supabase.rpc<
      any[],
      Record<string, never>
    >(
      'get_roommates'
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching roommates:', error);
    return { data: [], error };
  }
}
