
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
    const { data, error } = await supabase.rpc<
      RPCConversationType[],
      { user_id: string }
    >(
      'get_conversations',
      { user_id: userId }
    );
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: [], error };
  }
}

export async function getMessages(conversationId: string) {
  try {
    // Get all messages for this conversation
    const { data: messages, error: messagesError } = await supabase.rpc<
      RPCMessageType[],
      { conversation_id_param: string }
    >(
      'get_messages_for_conversation',
      { conversation_id_param: conversationId }
    ).order('created_at', { ascending: true });
    
    if (messagesError) {
      throw messagesError;
    }
    
    return { data: messages, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: [], error };
  }
}

export async function countUnreadMessages(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase.rpc<
      { count: number },
      { conversation_id_param: string; user_id_param: string }
    >(
      'count_unread_messages',
      { 
        conversation_id_param: conversationId,
        user_id_param: userId
      }
    );
    
    if (error) {
      throw error;
    }
    
    return { count: data.count, error: null };
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return { count: 0, error };
  }
}

export async function getOrCreateConversation(participant1Id: string, participant2Id: string) {
  try {
    // Use RPC function to get or create a conversation between two users
    const { data, error } = await supabase.rpc<
      RPCConversationType,
      { participant1_id_param: string; participant2_id_param: string }
    >(
      'get_or_create_conversation',
      { 
        participant1_id_param: participant1Id,
        participant2_id_param: participant2Id
      }
    );
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    return { data: null, error };
  }
}

export async function sendMessage(conversationId: string, senderId: string, receiverId: string, content: string) {
  try {
    const { data, error } = await supabase.rpc<
      { id: string },
      { conversation_id_param: string; sender_id_param: string; receiver_id_param: string; content_param: string }
    >(
      'create_message',
      { 
        conversation_id_param: conversationId,
        sender_id_param: senderId,
        receiver_id_param: receiverId,
        content_param: content
      }
    );
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase.rpc<
      { success: boolean },
      { conversation_id_param: string; user_id_param: string }
    >(
      'mark_messages_as_read',
      { 
        conversation_id_param: conversationId,
        user_id_param: userId
      }
    );
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { data: null, error };
  }
}
