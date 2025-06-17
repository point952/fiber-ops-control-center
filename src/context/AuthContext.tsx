
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";

export type UserRole = 'admin' | 'operator' | 'technician';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  username?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  getAllUsers: () => Promise<UserProfile[]>;
  addUser: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  updateUser: (userId: string, data: Partial<UserProfile>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleAuthStateChange = (event: string, session: Session | null) => {
      if (!isMounted) return;

      console.log('Auth state changed:', event, session?.user?.id);
      setSession(session);
      
      if (session?.user && event !== 'SIGNED_OUT') {
        setTimeout(() => {
          if (isMounted) {
            fetchUserProfile(session.user.id);
          }
        }, 0);
      } else {
        setUser(null);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('Profile fetched:', profile);
        setUser({
          id: profile.id,
          name: profile.name || 'Usuário',
          role: profile.role as UserRole,
          email: profile.email,
          username: profile.name || profile.email
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return profiles.map(profile => ({
        id: profile.id,
        name: profile.name || 'Usuário',
        role: profile.role as UserRole,
        email: profile.email,
        username: profile.name || profile.email
      }));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  };

  const addUser = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      console.log('Adding user with:', { email, name, role });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        console.error('Add user error:', error);
        toast.error('Erro ao criar usuário: ' + error.message);
        return false;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            role,
            email
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Erro ao criar perfil do usuário');
          return false;
        }

        toast.success('Usuário criado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Add user exception:', error);
      toast.error('Erro inesperado ao criar usuário');
      return false;
    }
  };

  const updateUser = async (userId: string, data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) {
        console.error('Update user error:', error);
        toast.error('Erro ao atualizar usuário');
        return false;
      }

      toast.success('Usuário atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Update user exception:', error);
      toast.error('Erro inesperado ao atualizar usuário');
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Delete user error:', error);
        toast.error('Erro ao deletar usuário');
        return false;
      }

      toast.success('Usuário deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Delete user exception:', error);
      toast.error('Erro inesperado ao deletar usuário');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Erro ao fazer login: ' + error.message);
        return false;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        toast.success('Login realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('Erro inesperado ao fazer login');
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      console.log('Attempting signup for:', email, 'with role:', role);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error('Erro ao criar conta: ' + error.message);
        return false;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            role,
            email
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Erro ao criar perfil do usuário');
          return false;
        }

        console.log('Signup successful for user:', data.user.id);
        toast.success('Conta criada com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup exception:', error);
      toast.error('Erro inesperado ao criar conta');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading,
      login,
      logout,
      signup,
      getAllUsers,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
