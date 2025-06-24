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

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Se não encontrar o perfil, cria um default
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const defaultProfile = {
            id: userId,
            name: sessionData.session.user.email?.split('@')[0] || 'Usuário',
            role: 'technician' as const,
            email: sessionData.session.user.email
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile);

          if (insertError) {
            console.error('Error creating default profile:', insertError);
            return null;
          }

          return {
            id: defaultProfile.id,
            name: defaultProfile.name,
            role: 'technician',
            email: defaultProfile.email,
            username: defaultProfile.name
          };
        }
        return null;
      }

      if (profile) {
        console.log('Profile fetched:', profile);
        const normalizedRole = normalizeRole(profile.role);
        return {
          id: profile.id,
          name: profile.name || 'Usuário',
          role: normalizedRole,
          email: profile.email,
          username: profile.name || profile.email
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, [normalizeRole]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Primeiro, obter a sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('Current session:', currentSession?.user?.id || 'none');

        if (currentSession?.user && mounted) {
          setSession(currentSession);
          const userProfile = await fetchUserProfile(currentSession.user.id);
          if (mounted) {
            setUser(userProfile);
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener DEPOIS da inicialização
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.id || 'none');
      
      if (!mounted) return;

      setSession(newSession);
      
      if (newSession?.user && event !== 'SIGNED_OUT') {
        const userProfile = await fetchUserProfile(newSession.user.id);
        setUser(userProfile);
      } else {
        setUser(null);
      }
    });

    // Inicializar
    initAuth();

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
        password
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
