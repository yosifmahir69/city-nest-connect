
// This file contains type definitions for our database tables
import { Database } from '@/integrations/supabase/types';

// Define the raw types from the database
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Define the conversation table type
export type ConversationRow = {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
};

// Define the message table type
export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

// Define the invite code table type
export type InviteCodeRow = {
  id: string;
  code: string;
  created_by: string;
  created_at: string;
  used_by?: string | null;
  used_at?: string | null;
};

// Define RPC function return types
export type RPCConversationType = {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
};

export type RPCMessageType = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type RPCInviteCodeType = {
  id: string;
  code: string;
  created_by: string;
  created_at: string;
  used_by?: string | null;
  used_at?: string | null;
};

// Define FilterType for roommates
export interface RoommateFilters {
  gender?: string[];
  company?: string[];
  officeLocation?: string[];
  neighborhood?: string[];
  budgetMin?: number;
  budgetMax?: number;
  hasCar?: boolean | null;
  lifestyleTags?: string[];
}

// RPC function types
export interface RPCFunctions {
  get_conversations: {
    Args: { user_id: string };
    Returns: RPCConversationType[];
  };
  get_messages_for_conversation: {
    Args: { conversation_id_param: string };
    Returns: RPCMessageType[];
  };
  count_unread_messages: {
    Args: { conversation_id_param: string; user_id_param: string };
    Returns: { count: number };
  };
  get_or_create_conversation: {
    Args: { participant1_id_param: string; participant2_id_param: string };
    Returns: RPCConversationType;
  };
  create_message: {
    Args: {
      conversation_id_param: string;
      sender_id_param: string;
      receiver_id_param: string;
      content_param: string;
    };
    Returns: { id: string };
  };
  mark_messages_as_read: {
    Args: { conversation_id_param: string; user_id_param: string };
    Returns: { success: boolean };
  };
  create_invite_code: {
    Args: { code_param: string; created_by_param: string };
    Returns: { id: string };
  };
  get_invite_codes: {
    Args: Record<string, never>;
    Returns: RPCInviteCodeType[];
  };
  get_roommates: {
    Args: Record<string, never>;
    Returns: any[]; // Using any[] as we don't have the exact type definition
  };
}

// Utility type to help with RPC calls
export type RPCFunctionName = keyof RPCFunctions;
