

import { supabase } from '@/integrations/supabase/client';

interface DatabaseResult {
  data: any;
  error: any;
}

export async function checkAdminExists(): Promise<DatabaseResult> {
  try {
    const result = await supabase
      .from('profiles')
      .select('id')
      .eq('username', 'admin');
    
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function checkUserExists(email: string, username: string): Promise<DatabaseResult> {
  try {
    const result = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`);
    
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createAuthUser(email: string, password: string): Promise<DatabaseResult> {
  try {
    const result = await supabase.auth.signUp({
      email,
      password
    });
    
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createUserProfile(userId: string, username: string, role: string, name: string, email: string): Promise<DatabaseResult> {
  try {
    const result = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        role,
        name,
        email
      });
    
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

