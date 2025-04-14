
import { supabase } from '@/integrations/supabase/client';
import { 
  RPCConversationType, 
  RPCMessageType, 
  RPCFunctionArgs,
  RPCFunctionReturns
} from '../db-types';

// Messaging related functions
export async function getConversations(userId: string) {
  try {
    const { data, error } = await supabase.rpc(
      'get_conversations',
      { user_id: userId } as RPCFunctionArgs<'get_conversations'>
    );
    
    if (error) {
      throw error;
    }
    
    return { data: data as RPCFunctionReturns<'get_conversations'>, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: [], error };
  }
}

export async function getMessages(conversationId: string) {
  try {
    // Get all messages for this conversation
    const { data: messages, error: messagesError } = await supabase.rpc(
      'get_messages_for_conversation',
      { conversation_id_param: conversationId } as RPCFunctionArgs<'get_messages_for_conversation'>
    ).order('created_at', { ascending: true });
    
    if (messagesError) {
      throw messagesError;
    }
    
    return { data: messages as RPCFunctionReturns<'get_messages_for_conversation'>, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: [], error };
  }
}

export async function countUnreadMessages(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase.rpc(
      'count_unread_messages',
      { 
        conversation_id_param: conversationId,
        user_id_param: userId
      } as RPCFunctionArgs<'count_unread_messages'>
    );
    
    if (error) {
      throw error;
    }
    
    const result = data as RPCFunctionReturns<'count_unread_messages'>;
    return { count: result.count, error: null };
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return { count: 0, error };
  }
}

export async function getOrCreateConversation(participant1Id: string, participant2Id: string) {
  try {
    // Use RPC function to get or create a conversation between two users
    const { data, error } = await supabase.rpc(
      'get_or_create_conversation',
      { 
        participant1_id_param: participant1Id,
        participant2_id_param: participant2Id
      } as RPCFunctionArgs<'get_or_create_conversation'>
    );
    
    if (error) {
      throw error;
    }
    
    return { data: data as RPCFunctionReturns<'get_or_create_conversation'>, error: null };
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    return { data: null, error };
  }
}

export async function sendMessage(conversationId: string, senderId: string, receiverId: string, content: string) {
  try {
    const { data, error } = await supabase.rpc(
      'create_message',
      { 
        conversation_id_param: conversationId,
        sender_id_param: senderId,
        receiver_id_param: receiverId,
        content_param: content
      } as RPCFunctionArgs<'create_message'>
    );
    
    if (error) {
      throw error;
    }
    
    return { data: data as RPCFunctionReturns<'create_message'>, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase.rpc(
      'mark_messages_as_read',
      { 
        conversation_id_param: conversationId,
        user_id_param: userId
      } as RPCFunctionArgs<'mark_messages_as_read'>
    );
    
    if (error) {
      throw error;
    }
    
    return { data: data as RPCFunctionReturns<'mark_messages_as_read'>, error: null };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { data: null, error };
  }
}
