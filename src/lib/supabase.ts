
import { supabase } from '@/integrations/supabase/client';

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
    const transformedData = {
      id: data.id,
      email: '', // We don't store email in profiles table
      fullName: data.full_name,
      profileImage: data.profile_image_url,
      jobType: data.job_type,
      company: data.company,
      officeLocation: data.office_location,
      startDate: data.start_date,
      endDate: data.end_date,
      gender: data.gender,
      preferredRoommateGenders: data.preferred_roommate_genders || [],
      hasCar: data.has_car || false,
      preferredNeighborhoods: data.preferred_neighborhoods || [],
      budgetMin: data.budget_min,
      budgetMax: data.budget_max,
      lifestyleTags: data.lifestyle_tags || [],
      firstTimeInCity: data.first_time_in_city || false,
      additionalPreferences: data.additional_preferences || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
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
  const transformedData = data?.map((profile) => ({
    id: profile.id,
    email: '', // We don't expose email addresses
    fullName: profile.full_name,
    profileImage: profile.profile_image_url,
    jobType: profile.job_type,
    company: profile.company,
    officeLocation: profile.office_location,
    startDate: profile.start_date,
    endDate: profile.end_date,
    gender: profile.gender,
    preferredRoommateGenders: profile.preferred_roommate_genders || [],
    hasCar: profile.has_car || false,
    preferredNeighborhoods: profile.preferred_neighborhoods || [],
    budgetMin: profile.budget_min,
    budgetMax: profile.budget_max,
    lifestyleTags: profile.lifestyle_tags || [],
    firstTimeInCity: profile.first_time_in_city || false,
    additionalPreferences: profile.additional_preferences || [],
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  }));
  
  return { data: transformedData || [], error: null };
}

// For messaging functions
export async function getConversations(userId: string) {
  // First, get conversation IDs where the user is a participant
  const { data: conversationData, error: conversationError } = await supabase
    .from('conversations')
    .select('id, created_at')
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);
  
  if (conversationError || !conversationData) {
    console.error('Error fetching conversations:', conversationError);
    return { data: [], error: conversationError };
  }
  
  // For each conversation, get the other participant's info and the last message
  const conversations = await Promise.all(
    conversationData.map(async (conv) => {
      // Get conversation details
      const { data: details, error: detailsError } = await supabase
        .from('conversations')
        .select('*, messages!messages_conversation_id_fkey(id, sender_id, content, created_at, read)')
        .eq('id', conv.id)
        .order('created_at', { foreignTable: 'messages', ascending: false })
        .limit(1, { foreignTable: 'messages' })
        .single();
      
      if (detailsError || !details) {
        console.error('Error fetching conversation details:', detailsError);
        return null;
      }
      
      // Determine the other participant
      const otherParticipantId = details.participant1_id === userId 
        ? details.participant2_id 
        : details.participant1_id;
      
      // Get the other participant's profile
      const { data: otherUser } = await getUserProfile(otherParticipantId);
      
      if (!otherUser) {
        return null;
      }
      
      const lastMessage = details.messages?.[0];
      
      return {
        id: conv.id,
        participantIds: [details.participant1_id, details.participant2_id],
        lastMessageId: lastMessage?.id || '',
        lastMessageContent: lastMessage?.content || 'Start a conversation',
        lastMessageTime: lastMessage?.created_at || details.created_at,
        unreadCount: lastMessage && lastMessage.sender_id !== userId && !lastMessage.read ? 1 : 0,
        otherUser
      };
    })
  );
  
  return { 
    data: conversations.filter(Boolean), 
    error: null 
  };
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return { data: [], error };
  }
  
  return { data, error: null };
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  // First, check if conversation exists
  const { data: existingConv, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant1_id.eq.${senderId},participant2_id.eq.${receiverId}),and(participant1_id.eq.${receiverId},participant2_id.eq.${senderId})`)
    .limit(1)
    .maybeSingle();
  
  let conversationId;
  
  // If no conversation exists, create one
  if (!existingConv) {
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: senderId,
        participant2_id: receiverId
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating conversation:', createError);
      return { data: null, error: createError };
    }
    
    conversationId = newConv.id;
  } else {
    conversationId = existingConv.id;
  }
  
  // Send the message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      read: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId)
    .eq('read', false);
  
  return { data, error };
}

// Admin functions
export async function generateInviteCode(adminId: string) {
  const code = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      created_by: adminId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  return { data, error };
}

export async function getInviteCodes() {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
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
