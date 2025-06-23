
import { supabase } from '@/integrations/supabase/client';

export async function checkAdminExists(): Promise<{ data: any; error: any }> {
  const result = await supabase
    .from('profiles')
    .select('id')
    .eq('username', 'admin');
  
  return result;
}

export async function checkUserExists(email: string, username: string): Promise<{ data: any; error: any }> {
  const result = await supabase
    .from('profiles')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`);
  
  return result;
}

export async function createAuthUser(email: string, password: string): Promise<{ data: any; error: any }> {
  const result = await supabase.auth.signUp({
    email,
    password
  });
  
  return result;
}

export async function createUserProfile(userId: string, username: string, role: string, name: string, email: string): Promise<{ data: any; error: any }> {
  const result = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username,
      role,
      name,
      email
    });
  
  return result;
}
