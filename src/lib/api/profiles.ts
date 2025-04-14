
import { supabase } from '@/integrations/supabase/client';
import { transformProfile } from '../data-transformers';
import { User } from '@/types';
import { ProfileRow } from '../db-types';

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

// New function to get all users (for admin panel)
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data for frontend use
    const transformedData = data?.map(profile => transformProfile(profile as ProfileRow));
    
    return { data: transformedData || [], error: null };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return { data: null, error: error as Error };
  }
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
