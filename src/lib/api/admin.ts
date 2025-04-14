
import { supabase } from '@/integrations/supabase/client';
import { 
  RPCInviteCodeType, 
  RPCFunctionArgs,
  RPCFunctionReturns
} from '../db-types';

// Admin functions
export async function generateInviteCode(adminId: string) {
  try {
    const code = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { data, error } = await supabase.rpc<RPCFunctionReturns<'create_invite_code'>>(
      'create_invite_code', 
      {
        code_param: code,
        created_by_param: adminId
      } as RPCFunctionArgs<'create_invite_code'>
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error in generateInviteCode:', error);
    return { data: null, error: error as Error };
  }
}

export async function getInviteCodes() {
  try {
    const { data, error } = await supabase.rpc<RPCFunctionReturns<'get_invite_codes'>>(
      'get_invite_codes'
    ).order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error in getInviteCodes:', error);
    return { data: null, error: error as Error };
  }
}
