import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from "sonner";

export type UserRole = 'admin' | 'operator' | 'technician';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<UserProfile[]>;
  addUser: (user: Omit<UserProfile, 'id'> & { password: string; email: string }) => Promise<void>;
  updateUser: (user: UserProfile) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  updateOnlineStatus: (isOnline: boolean) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ativa
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session.user.id);
          // Atualizar status online ao iniciar sessão
          await updateOnlineStatus(true);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session.user.id);
        // Atualizar status online ao fazer login
        await updateOnlineStatus(true);
      } else if (event === 'SIGNED_OUT') {
        // Atualizar status online ao fazer logout
        if (user) {
          await updateOnlineStatus(false);
        }
        setUser(null);
      } else if (event === 'USER_UPDATED') {
        if (session) {
          await fetchUserProfile(session.user.id);
        }
      }
    });

    // Atualizar status online periodicamente
    const interval = setInterval(async () => {
      if (user) {
        await updateOnlineStatus(true);
      }
    }, 30000); // A cada 30 segundos

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setUser(null);
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id);
        // Atualizar status online ao fazer login
        await updateOnlineStatus(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Atualizar status online antes de fazer logout
      if (user) {
        await updateOnlineStatus(false);
      }
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('online_users')
        .upsert({
          user_id: user.id,
          user_type: user.role === 'admin' ? 'operator' : user.role,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status online:', error);
    }
  };

  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  };

  const addUser = async (user: Omit<UserProfile, 'id'> & { password: string; email: string }) => {
    try {
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: user.username,
            name: user.name,
            role: user.role
          });

        if (profileError) throw profileError;

        toast.success('Usuário criado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
      throw error;
    }
  };

  const updateUser = async (user: UserProfile): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: user.username,
          role: user.role,
          name: user.name,
        })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // Primeiro, deletar o perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) throw profileError;

      // Depois, deletar o usuário do auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) throw authError;

      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      getAllUsers,
      addUser,
      updateUser,
      deleteUser,
      updateOnlineStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
