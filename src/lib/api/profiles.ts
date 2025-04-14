
import { supabase } from '@/integrations/supabase/client';
import { transformProfile } from '../data-transformers';
import { User } from '@/types';
import { ProfileRow } from '../db-types';

// Profile related functions
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
    
    return { data: transformProfile(data as ProfileRow), error: null };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error };
  }
}

export async function createUserProfile(userId: string, profileData: Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData,
        },
      ]);
    
    if (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { data: null, error };
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<User>) {
  try {
    // Convert User object to ProfileRow format
    const profileRowData: Partial<ProfileRow> = {
      full_name: profileData.fullName,
      job_type: profileData.jobType,
      company: profileData.company,
      office_location: profileData.officeLocation,
      start_date: profileData.startDate,
      end_date: profileData.endDate,
      has_car: profileData.hasCar,
      budget_min: profileData.budgetMin,
      budget_max: profileData.budgetMax,
      first_time_in_city: profileData.firstTimeInCity,
      profile_image_url: profileData.profileImage,
      lifestyle_tags: profileData.lifestyleTags,
      preferred_neighborhoods: profileData.preferredNeighborhoods,
      gender: profileData.gender,
      preferred_roommate_genders: profileData.preferredRoommateGenders,
      additional_preferences: profileData.additionalPreferences,
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileRowData)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { data: null, error };
  }
}

export async function uploadProfileImage(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('public')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { data: null, error: uploadError };
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('public')
      .getPublicUrl(filePath);
    
    // Update the user's profile with the new image URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile with image URL:', error);
      return { data: null, error };
    }
    
    return { data: { url: publicUrl }, error: null };
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return { data: null, error };
  }
}

export async function getRoommates() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Transform into User objects
    const users = data.map(profile => transformProfile(profile));
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Error fetching roommates:', error);
    return { data: [], error };
  }
}

// Function to get all users
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Transform into User objects
    const users = data.map(profile => transformProfile(profile));
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { data: [], error };
  }
}
