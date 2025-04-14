
import { supabase } from '@/integrations/supabase/client';
import { transformProfile } from './data-transformers';
import { User } from '@/types';
import { ProfileRow } from './db-types';
import { 
  getConversations, 
  getMessages, 
  sendMessage,
  markMessagesAsRead, 
  generateInviteCode, 
  getInviteCodes,
  getUserProfile,
  createUserProfile,
  getRoommates
} from './supabase-api';

// Re-export messaging and admin functions
export { 
  getConversations, 
  getMessages, 
  sendMessage,
  markMessagesAsRead, 
  generateInviteCode, 
  getInviteCodes,
  getUserProfile,
  createUserProfile,
  getRoommates
};

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
  console.log("Updating profile for:", userId, profileData);
  
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

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select();
  
  if (error) {
    console.error('Error fetching all users:', error);
    return { data: null, error };
  }
  
  // Transform the data for frontend use
  const transformedData = data?.map(profile => transformProfile(profile as ProfileRow));
  
  return { data: transformedData || [], error: null };
}
