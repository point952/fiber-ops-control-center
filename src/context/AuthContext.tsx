
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const normalizeRole = useCallback((role: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      'operador': 'operator',
      'operator': 'operator',
      'técnico': 'technician',
      'technician': 'technician',
      'admin': 'admin',
      'administrador': 'admin'
    };
    return roleMap[role.toLowerCase()] || 'technician';
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error } = await profileQuery;

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          const sessionData = await supabase.auth.getSession();
          if (sessionData.data.session?.user) {
            await createDefaultProfile(sessionData.data.session.user);
          }
        }
        return;
      }

      if (profile) {
        console.log('Profile fetched:', profile);
        const normalizedRole = normalizeRole(profile.role);
        setUser({
          id: profile.id,
          name: profile.name || 'Usuário',
          role: normalizedRole,
          email: profile.email,
          username: profile.name || profile.email
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeRole]);

  const createDefaultProfile = async (authUser: User) => {
    try {
      const profileData = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
        role: 'technician' as const,
        email: authUser.email
      };

      const { error } = await supabase
        .from('profiles')
        .insert(profileData);

      if (error) {
        console.error('Error creating default profile:', error);
      } else {
        console.log('Default profile created successfully');
        await fetchUserProfile(authUser.id);
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.id);
      setSession(session);
      
      if (session?.user && event !== 'SIGNED_OUT') {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.id);
        
        if (session?.user) {
          setSession(session);
          await fetchUserProfile(session.user.id);
        } else {
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

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
        role: normalizeRole(profile.role),
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
      
      const userCredentials = {
        email: email as string,
        password: password as string,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name as string,
            role: role as string
          }
        }
      };

      const { data, error } = await supabase.auth.signUp(userCredentials);

      if (error) {
        console.error('Add user error:', error);
        toast.error('Erro ao criar usuário: ' + error.message);
        return false;
      }

      if (data.user) {
        const profileData = {
          id: data.user.id,
          name: name as string,
          role: role as string,
          email: email as string
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

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
      
      const credentials = {
        email: email as string,
        password: password as string
      };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

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

      const userCredentials = {
        email: email as string,
        password: password as string,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name as string,
            role: role as string
          }
        }
      };

      const { data, error } = await supabase.auth.signUp(userCredentials);

      if (error) {
        console.error('Signup error:', error);
        toast.error('Erro ao criar conta: ' + error.message);
        return false;
      }

      if (data.user) {
        const profileData = {
          id: data.user.id,
          name: name as string,
          role: role as string,
          email: email as string
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

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
