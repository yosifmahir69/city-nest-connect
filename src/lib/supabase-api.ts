
import { supabase } from '@/integrations/supabase/client';
import { transformProfile, transformMessage, transformConversation } from './data-transformers';
import { User, Conversation, Message } from '@/types';
import { ProfileRow, ConversationRow, MessageRow, InviteCodeRow } from './db-types';

// Messaging related functions
export async function getConversations(userId: string) {
  try {
    // We'll use RPC for getting conversations
    const { data: conversationData, error: conversationError } = await supabase.rpc(
      'get_conversations',
      { user_id: userId }
    );
    
    if (conversationError) {
      console.error('Error fetching conversations:', conversationError);
      return { data: [], error: conversationError };
    }
    
    if (!conversationData || conversationData.length === 0) {
      return { data: [], error: null };
    }
    
    // For each conversation, get the other participant's info and the last message
    const conversations = await Promise.all(
      conversationData.map(async (conv: any) => {
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
        const { data: messagesData } = await supabase.rpc(
          'get_messages_for_conversation',
          { conversation_id_param: conv.id }
        ).order('created_at', { ascending: false }).limit(1);
        
        const lastMessage = messagesData && messagesData.length > 0 ? messagesData[0] : null;
        
        // Count unread messages
        const { count } = await supabase.rpc(
          'count_unread_messages',
          { 
            conversation_id_param: conv.id,
            user_id_param: userId
          }
        );
        
        // Transform the data
        return transformConversation(
          conv,
          otherUser,
          lastMessage,
          count || 0
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
    const { data, error } = await supabase.rpc(
      'get_messages_for_conversation',
      { conversation_id_param: conversationId }
    ).order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return { data: [], error };
    }
    
    // Transform data for frontend use
    const transformedData = (data || []).map((message: any) => transformMessage(message));
    
    return { data: transformedData || [], error: null };
  } catch (error) {
    console.error('Error in getMessages:', error);
    return { data: [], error };
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    // First, check if conversation exists
    const { data: existingConv, error: convError } = await supabase.rpc(
      'get_or_create_conversation',
      { 
        participant1_id_param: senderId, 
        participant2_id_param: receiverId 
      }
    );
    
    if (convError || !existingConv) {
      console.error('Error with conversation:', convError);
      return { data: null, error: convError };
    }
    
    // Send the message
    const { data, error } = await supabase.rpc(
      'create_message',
      {
        conversation_id_param: existingConv.id,
        sender_id_param: senderId,
        receiver_id_param: receiverId,
        content_param: content
      }
    );
    
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
    const { data, error } = await supabase.rpc(
      'mark_messages_as_read',
      {
        conversation_id_param: conversationId,
        user_id_param: userId
      }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return { data: null, error: error as Error };
  }
}

// Admin functions
export async function generateInviteCode(adminId: string) {
  try {
    const code = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { data, error } = await supabase.rpc(
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
    const { data, error } = await supabase.rpc('get_invite_codes')
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error in getInviteCodes:', error);
    return { data: null, error: error as Error };
  }
}

// User profile functions
export async function createUserProfile(userId: string, profileData: any) {
  console.log("Creating profile for:", userId, profileData);
  
  const { fullName, jobType, company, officeLocation, startDate, endDate, gender, 
    preferredRoommateGenders, hasCar, preferredNeighborhoods, budgetMin, budgetMax, 
    lifestyleTags, firstTimeInCity, additionalPreferences } = profileData;
  
  return supabase
    .from('profiles')
    .update({
      full_name: fullName,
      job_type: jobType,
      company,
      office_location: officeLocation,
      start_date: startDate,
      end_date: endDate,
      gender,
      preferred_roommate_genders: preferredRoommateGenders,
      has_car: hasCar,
      preferred_neighborhoods: preferredNeighborhoods,
      budget_min: budgetMin,
      budget_max: budgetMax,
      lifestyle_tags: lifestyleTags,
      first_time_in_city: firstTimeInCity,
      additional_preferences: additionalPreferences,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

export async function getUserProfile(userId: string) {
  console.log("Getting profile for user:", userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
  
  // Transform from snake_case to camelCase for frontend use
  if (data) {
    const transformedData = transformProfile(data as ProfileRow);
    console.log("Transformed profile data:", transformedData);
    return { data: transformedData, error: null };
  }
  
  return { data: null, error };
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select();
  
  if (error) {
    console.error('Error fetching all profiles:', error);
    return { data: null, error };
  }
  
  // Transform the data for frontend use
  const transformedData = data?.map(profile => transformProfile(profile as ProfileRow));
  
  return { data: transformedData || [], error: null };
}

export async function getRoommates(filters: any = {}) {
  console.log("Fetching roommates with filters:", filters);
  
  let query = supabase.from('profiles').select();
  
  // Skip the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    query = query.neq('id', user.id);
  }
  
  // Apply filters
  if (filters?.gender && filters.gender.length > 0) {
    query = query.in('gender', filters.gender);
  }
  
  if (filters?.company && filters.company.length > 0) {
    query = query.ilike('company', `%${filters.company[0]}%`);
  }
  
  if (filters?.budgetMin && filters?.budgetMax) {
    query = query.gte('budget_min', filters.budgetMin)
                .lte('budget_max', filters.budgetMax);
  }
  
  if (filters?.neighborhood && filters?.neighborhood.length > 0) {
    query = query.overlaps('preferred_neighborhoods', filters.neighborhood);
  }
  
  // Execute the query
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching roommates:', error);
    return { data: null, error };
  }
  
  console.log("Raw roommate data:", data);
  
  // Transform the data for frontend use
  const transformedData = data?.map(profile => transformProfile(profile as ProfileRow));
  
  console.log("Transformed roommate data:", transformedData);
  
  return { data: transformedData || [], error: null };
}
