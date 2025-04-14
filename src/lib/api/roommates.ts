
import { supabase } from '@/integrations/supabase/client';
import { RoommateFilters, RPCFunctionArgs, RPCFunctionReturns } from '../db-types';

// Roommate-related functions
export async function getRoommates(filters?: RoommateFilters) {
  try {
    const { data, error } = await supabase.rpc(
      'get_roommates'
    );
    
    return { data: data as RPCFunctionReturns<'get_roommates'>, error };
  } catch (error) {
    console.error('Error fetching roommates:', error);
    return { data: [], error };
  }
}
