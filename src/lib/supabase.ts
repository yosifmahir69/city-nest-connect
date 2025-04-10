
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

// Roommate discovery functions
export async function getRoommates(filters: any) {
  let query = supabase.from('profiles').select('*');
  
  // Apply filters
  if (filters?.gender) {
    query = query.in('gender', filters.gender);
  }
  
  if (filters?.companyName) {
    query = query.ilike('company', `%${filters.companyName}%`);
  }
  
  if (filters?.budgetMin && filters?.budgetMax) {
    query = query.gte('budget_min', filters.budgetMin)
                .lte('budget_max', filters.budgetMax);
  }
  
  if (filters?.neighborhoods && filters?.neighborhoods.length > 0) {
    query = query.overlaps('preferred_neighborhoods', filters.neighborhoods);
  }
  
  return query;
}

// For demo purposes, implementing simple versions of these functions
// Messaging functions
export async function getConversations(userId: string) {
  // In a real app, we would have a conversations table
  // For demo, we'll return some mock data
  return { 
    data: [
      {
        id: 'conv-1',
        participantIds: [userId, 'user-2'],
        lastMessageId: 'msg-1',
        lastMessageContent: 'Hey, are you still looking for a roommate?',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
        otherUser: {
          id: 'user-2',
          fullName: 'Alex Johnson',
          profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
          company: 'Google',
          jobType: 'internship'
        }
      }
    ], 
    error: null 
  };
}

export async function getMessages(conversationId: string) {
  // Mock messages for demo
  return { 
    data: [
      {
        id: 'msg-1',
        senderId: 'user-2',
        receiverId: 'current-user',
        content: 'Hey, are you still looking for a roommate?',
        read: false,
        createdAt: new Date().toISOString()
      }
    ], 
    error: null 
  };
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  // In a real app, we would insert into a messages table
  console.log('Sending message:', { senderId, receiverId, content });
  return { 
    data: {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date().toISOString()
    }, 
    error: null 
  };
}

// Admin functions - simplified for demo
export async function generateInviteCode(adminId: string) {
  const code = `INVITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  console.log('Generated invite code:', code, 'by admin:', adminId);
  return { data: { code }, error: null };
}

export async function getInviteCodes() {
  return { 
    data: [
      { 
        id: 'code-1', 
        code: 'DEMO-123456', 
        createdBy: 'admin-user',
        createdAt: new Date().toISOString(),
        usedBy: null,
        usedAt: null
      }
    ], 
    error: null 
  };
}

export async function getAllUsers() {
  // In a real app, we would fetch from profiles table
  // For demo, return mock data
  return { 
    data: [
      {
        id: 'user-1',
        email: 'user1@example.com',
        fullName: 'Sam Taylor',
        company: 'Amazon',
        jobType: 'internship',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        fullName: 'Alex Johnson',
        company: 'Google',
        jobType: 'fulltime',
        createdAt: new Date().toISOString()
      }
    ], 
    error: null 
  };
}
