
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
