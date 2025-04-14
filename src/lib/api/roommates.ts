
import { supabase } from '@/integrations/supabase/client';

export async function getRoommates() {
  try {
    const { data, error } = await supabase
      .rpc('get_roommates', {}, { count: null });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching roommates:', error);
    return { data: [], error };
  }
}
