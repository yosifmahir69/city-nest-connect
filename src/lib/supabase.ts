
import { supabase } from '@/integrations/supabase/client';
import { transformProfile, transformMessage, transformConversation } from './data-transformers';
import { User, Conversation, Message } from '@/types';

// User related functions
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

// Profile related functions
export async function updateUserProfile(userId: string, profileData: any) {
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

export async function uploadProfileImage(userId: string, file: File) {
  // Create a unique file path without spaces and special characters
  const fileExt = file.name.split('.').pop();
  const safeFileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${safeFileName}`;
  
  // Upload the file to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('profile_images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) {
    return { data: null, error: uploadError };
  }
  
  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('profile_images')
    .getPublicUrl(filePath);
  
  // Update the user's profile with the new image URL
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({ profile_image_url: publicUrl })
    .eq('id', userId);
  
  return { 
    data: { url: publicUrl, profileData }, 
    error: profileError 
  };
}

// Fetch the current user's profile data
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
  
  // Transform from snake_case to camelCase for frontend use
  if (data) {
    const transformedData = transformProfile(data);
    return { data: transformedData, error: null };
  }
  
  return { data: null, error };
}

// Roommate discovery functions
export async function getRoommates(filters: any = {}) {
  let query = supabase.from('profiles').select('*');
  
  // Skip the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    query = query.neq('id', user.id);
  }
  
  // Apply filters
  if (filters?.gender && filters.gender.length > 0) {
    query = query.in('gender', filters.gender);
  }
  
  if (filters?.company) {
    query = query.ilike('company', `%${filters.company}%`);
  }
  
  if (filters?.budgetMin && filters?.budgetMax) {
    query = query.gte('budget_min', filters.budgetMin)
                .lte('budget_max', filters.budgetMax);
  }
  
  if (filters?.neighborhoods && filters?.neighborhoods.length > 0) {
    query = query.overlaps('preferred_neighborhoods', filters.neighborhoods);
  }
  
  // Execute the query
  const { data, error } = await query;
  
  if (error) {
    return { data: null, error };
  }
  
  // Transform the data for frontend use
  const transformedData = data?.map(profile => transformProfile(profile));
  
  return { data: transformedData || [], error: null };
}

// For messaging functions
export async function getConversations(userId: string) {
  // We'll use RPC for getting conversations
  const { data: conversationData, error: conversationError } = await supabase.rpc(
    'get_conversations',
    { user_id: userId }
  );
  
  if (conversationError || !conversationData) {
    console.error('Error fetching conversations:', conversationError);
    return { data: [], error: conversationError };
  }
  
  // For each conversation, get the other participant's info and the last message
  const conversations = await Promise.all(
    conversationData.map(async (conv: any) => {
      // Determine the other participant
      const otherParticipantId = conv.participant1_id === userId 
        ? conv.participant2_id 
        : conv.participant1_id;
      
      // Get the other participant's profile
      const { data: otherUser } = await getUserProfile(otherParticipantId);
      
      if (!otherUser) {
        return null;
      }
      
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
  
  return { 
    data: conversations.filter(Boolean) as Conversation[], 
    error: null 
  };
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase.rpc(
    'get_messages_for_conversation',
    { conversation_id_param: conversationId }
  ).order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return { data: [], error };
  }
  
  // Transform data for frontend use
  const transformedData = data?.map((message: any) => transformMessage(message));
  
  return { data: transformedData || [], error: null };
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
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
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { data, error } = await supabase.rpc(
    'mark_messages_as_read',
    {
      conversation_id_param: conversationId,
      user_id_param: userId
    }
  );
  
  return { data, error };
}

// Admin functions
export async function generateInviteCode(adminId: string) {
  const code = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const { data, error } = await supabase.rpc(
    'create_invite_code',
    {
      code_param: code,
      created_by_param: adminId
    }
  );
  
  return { data, error };
}

export async function getInviteCodes() {
  const { data, error } = await supabase.rpc('get_invite_codes')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}
