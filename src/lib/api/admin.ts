
import { supabase } from '@/integrations/supabase/client';
import { RPCFunctionName, RPCFunctions, RPCInviteCodeType } from '../db-types';

// Admin functions
export async function generateInviteCode(adminId: string) {
  try {
    const code = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { data, error } = await supabase.rpc<
      { id: string },
      { code_param: string; created_by_param: string }
    >(
      'create_invite_code', 
      {
        code_param: code,
        created_by_param: adminId
      }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error in generateInviteCode:', error);
    return { data: null, error: error as Error };
  }
}

export async function getInviteCodes() {
  try {
    const { data, error } = await supabase.rpc<
      RPCInviteCodeType[],
      Record<string, never>
    >(
      'get_invite_codes'
    ).order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error in getInviteCodes:', error);
    return { data: null, error: error as Error };
  }
}
