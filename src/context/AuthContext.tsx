import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from "sonner";

type UserRole = 'admin' | 'operator' | 'technician';

interface Profile {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string;
}

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAllUsers: () => Profile[];
  addUser: (newUser: Omit<Profile, 'id'> & { password: string }) => Promise<string>;
  updateUser: (user: Profile) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state and set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch user profile data separately to avoid recursive Supabase calls
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching user profile:', error);
                return;
              }
              
              if (profile) {
                setUser({
                  id: profile.id,
                  username: profile.email || '',
                  role: profile.role as UserRole,
                  name: profile.name || '',
                  email: profile.email
                });
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          if (profile) {
            setUser({
              id: profile.id,
              username: profile.email || '',
              role: profile.role as UserRole,
              name: profile.name || '',
              email: profile.email
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout exception:', error);
    }
  };

  // These functions are maintained for backward compatibility but use Supabase now
  const getAllUsers = () => {
    // This function would require admin privileges and a separate Edge Function in production
    // Keeping the interface for compatibility
    if (!user || user.role !== 'admin') {
      return [];
    }
    
    // We'll return the current user as a placeholder
    // In a real implementation, you would fetch all users from Supabase
    return user ? [user] : [];
  };

  const addUser = async (newUser: Omit<Profile, 'id'> & { password: string }) => {
    try {
      // Admin check
      if (!user || user.role !== 'admin') {
        throw new Error('Only admins can add users');
      }
      
      // Register user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email || newUser.username,
        password: newUser.password,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
          name: newUser.name,
          role: newUser.role
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error("Erro ao criar usuário");
        throw error;
      }

      return data.user.id;
    } catch (error) {
      console.error('Add user exception:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: Profile) => {
    try {
      // Admin check or self-update check
      if (!user || (user.role !== 'admin' && user.id !== updatedUser.id)) {
        return false;
      }
      
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          role: updatedUser.role,
          email: updatedUser.email
        })
        .eq('id', updatedUser.id);

      if (error) {
        console.error('Error updating user:', error);
        return false;
      }
      
      // If updating the current user, update local state
      if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Update user exception:', error);
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Admin check
      if (!user || user.role !== 'admin' || id === '1') {
        return false; // Prevent deleting admin user
      }
      
      // In Supabase, deleting a user from auth will cascade to the profiles table
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete user exception:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        login, 
        logout, 
        isAuthenticated: !!user,
        isLoading,
        getAllUsers,
        addUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
