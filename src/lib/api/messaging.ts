
import { supabase } from '@/integrations/supabase/client';
import { RPCFunctionArgs, RPCFunctionReturns, RPCConversationType, RPCMessageType } from '../db-types';

// Messaging functions
export async function getConversations(userId: string) {
  try {
    const { data, error } = await supabase.rpc<
      RPCConversationType[],
      { user_id_param: string }
    >(
      'get_conversations_for_user',
      { user_id_param: userId }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error in getConversations:', error);
    return { data: [], error };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const { data, error } = await supabase.rpc<
      RPCMessageType[],
      { conversation_id_param: string }
    >(
      'get_messages_for_conversation',
      { conversation_id_param: conversationId }
    ).order('created_at', { ascending: true });
    
    return { data, error };
  } catch (error) {
    console.error('Error in getMessages:', error);
    return { data: [], error };
  }
}

export async function countUnreadMessages(userId: string) {
  try {
    const { data, error } = await supabase.rpc<
      { count: number },
      { user_id_param: string }
    >(
      'count_unread_messages',
      { user_id_param: userId }
    );
    
    const count = data?.count || 0;
    
    return { count, error };
  } catch (error) {
    console.error('Error in countUnreadMessages:', error);
    return { count: 0, error };
  }
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  try {
    const { data, error } = await supabase.rpc<
      RPCConversationType,
      { user_id_param: string; other_user_id_param: string }
    >(
      'get_or_create_conversation',
      {
        user_id_param: userId,
        other_user_id_param: otherUserId
      }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    return { data: null, error };
  }
}

export async function sendMessage(senderId: string, conversationId: string, content: string) {
  try {
    const { data, error } = await supabase.rpc<
      { id: string },
      { sender_id_param: string; conversation_id_param: string; content_param: string }
    >(
      'send_message',
      {
        sender_id_param: senderId,
        conversation_id_param: conversationId,
        content_param: content
      }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { data: null, error };
  }
}

export async function markMessagesAsRead(userId: string, conversationId: string) {
  try {
    const { data, error } = await supabase.rpc<
      { success: boolean },
      { user_id_param: string; conversation_id_param: string }
    >(
      'mark_messages_as_read',
      {
        user_id_param: userId,
        conversation_id_param: conversationId
      }
    );
    
    return { success: data?.success || false, error };
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return { success: false, error };
  }
}
