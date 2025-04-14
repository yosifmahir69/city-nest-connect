
import { supabase } from '@/integrations/supabase/client';
import { transformProfile, transformMessage, transformConversation } from '../data-transformers';
import { User, Conversation, Message } from '@/types';
import { 
  ProfileRow, 
  RPCConversationType,
  RPCMessageType,
  RPCFunctions
} from '../db-types';

// Messaging related functions
export async function getConversations(userId: string) {
  try {
    // We'll use RPC for getting conversations
    const { data: conversationData, error: conversationError } = await supabase.rpc<
      RPCFunctions['get_conversations']['Returns'],
      RPCFunctions['get_conversations']['Args']
    >('get_conversations', { user_id: userId });
    
    if (conversationError) {
      console.error('Error fetching conversations:', conversationError);
      return { data: [], error: conversationError };
    }
    
    if (!conversationData || conversationData.length === 0) {
      return { data: [], error: null };
    }
    
    // For each conversation, get the other participant's info and the last message
    const conversations = await Promise.all(
      conversationData.map(async (conv: RPCConversationType) => {
        // Determine the other participant
        const otherParticipantId = conv.participant1_id === userId 
          ? conv.participant2_id 
          : conv.participant1_id;
        
        // Get the other participant's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', otherParticipantId)
          .single();
          
        if (profileError || !profileData) {
          console.error('Error fetching other participant:', profileError);
          return null;
        }
        
        const otherUser = transformProfile(profileData as ProfileRow);
        
        // Get the last message
        const { data: messagesData } = await supabase.rpc<
          RPCFunctions['get_messages_for_conversation']['Returns'],
          RPCFunctions['get_messages_for_conversation']['Args']
        >('get_messages_for_conversation', { conversation_id_param: conv.id })
          .order('created_at', { ascending: false })
          .limit(1);
        
        const lastMessage = messagesData && messagesData.length > 0 ? messagesData[0] : null;
        
        // Count unread messages
        const { data: countData } = await supabase.rpc<
          RPCFunctions['count_unread_messages']['Returns'],
          RPCFunctions['count_unread_messages']['Args']
        >('count_unread_messages', { 
          conversation_id_param: conv.id,
          user_id_param: userId
        });
        
        // Transform the data
        return transformConversation(
          conv,
          otherUser,
          lastMessage,
          countData?.count || 0
        );
      })
    );
    
    // Filter out null values (failed to fetch participant data)
    const validConversations = conversations.filter(Boolean) as Conversation[];
    
    return { 
      data: validConversations, 
      error: null 
    };
  } catch (error) {
    console.error('Error in getConversations:', error);
    return { data: [], error };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const { data, error } = await supabase.rpc<
      RPCFunctions['get_messages_for_conversation']['Returns'],
      RPCFunctions['get_messages_for_conversation']['Args']
    >('get_messages_for_conversation', { conversation_id_param: conversationId })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return { data: [], error };
    }
    
    // Transform data for frontend use
    const transformedData = (data || []).map((message: RPCMessageType) => transformMessage(message));
    
    return { data: transformedData || [], error: null };
  } catch (error) {
    console.error('Error in getMessages:', error);
    return { data: [], error };
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    // First, check if conversation exists
    const { data: existingConv, error: convError } = await supabase.rpc<
      RPCFunctions['get_or_create_conversation']['Returns'],
      RPCFunctions['get_or_create_conversation']['Args']
    >('get_or_create_conversation', { 
      participant1_id_param: senderId, 
      participant2_id_param: receiverId 
    });
    
    if (convError || !existingConv) {
      console.error('Error with conversation:', convError);
      return { data: null, error: convError };
    }
    
    // Send the message
    const { data, error } = await supabase.rpc<
      RPCFunctions['create_message']['Returns'],
      RPCFunctions['create_message']['Args']
    >('create_message', {
      conversation_id_param: existingConv.id,
      sender_id_param: senderId,
      receiver_id_param: receiverId,
      content_param: content
    });
    
    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { data: null, error };
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase.rpc<
      RPCFunctions['mark_messages_as_read']['Returns'],
      RPCFunctions['mark_messages_as_read']['Args']
    >('mark_messages_as_read', {
      conversation_id_param: conversationId,
      user_id_param: userId
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return { data: null, error: error as Error };
  }
}
