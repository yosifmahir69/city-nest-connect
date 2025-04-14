
import { supabase } from '@/integrations/supabase/client';

// Auth functions
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { data: data.user, error };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error('Error in signIn:', error);
    return { data: null, error };
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error('Error in signUp:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error in signOut:', error);
    return { error };
  }
}
