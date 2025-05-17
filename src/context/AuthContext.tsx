
import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'admin' | 'operator' | 'technician';

interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string; // Added email as optional property
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAllUsers: () => User[];
  addUser: (newUser: Omit<User, 'id'> & { password: string }) => string;
  updateUser: (user: User) => boolean;
  deleteUser: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - in a real application, this would be stored in a secure backend
const DEFAULT_USERS = [
  {
    id: '1',
    username: 'admin',
    password: '#point#123',
    role: 'admin' as UserRole,
    name: 'Administrador',
    email: 'admin@example.com'
  },
  {
    id: '2',
    username: 'operator',
    password: 'operator123',
    role: 'operator' as UserRole,
    name: 'Operador Padrão',
    email: 'operator@example.com'
  },
  {
    id: '3',
    username: 'tech',
    password: 'tech123',
    role: 'technician' as UserRole,
    name: 'Técnico Padrão',
    email: 'tech@example.com'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersDb, setUsersDb] = useState<Array<User & { password: string }>>([]);

  // Initialize users on first load
  useEffect(() => {
    // Try to load users from localStorage, otherwise use default
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsersDb(JSON.parse(storedUsers));
    } else {
      setUsersDb(DEFAULT_USERS);
      localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }

    // Load current logged in user if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = usersDb.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const getAllUsers = () => {
    return usersDb.map(({ password, ...user }) => user);
  };

  const addUser = (newUser: Omit<User, 'id'> & { password: string }) => {
    // Check if username is unique
    if (usersDb.some(u => u.username === newUser.username)) {
      throw new Error('Username already exists');
    }
    
    const newId = String(Date.now());
    const userWithId = { ...newUser, id: newId };
    
    // Update state and localStorage
    const updatedUsers = [...usersDb, userWithId];
    setUsersDb(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    return newId;
  };

  const updateUser = (updatedUser: User) => {
    // Find user in database
    const userIndex = usersDb.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex === -1) return false;
    
    // Get existing password since we don't modify it here
    const existingPassword = usersDb[userIndex].password;
    
    // Create updated user with password
    const userWithPassword = { ...updatedUser, password: existingPassword };
    
    // Update state and localStorage
    const updatedUsers = [...usersDb];
    updatedUsers[userIndex] = userWithPassword;
    setUsersDb(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If the current user was updated, update that state too
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return true;
  };

  const deleteUser = (id: string) => {
    // Don't allow deleting the admin user (id: 1)
    if (id === '1') return false;
    
    // Check if user exists
    if (!usersDb.some(u => u.id === id)) return false;
    
    // Update state and localStorage
    const updatedUsers = usersDb.filter(u => u.id !== id);
    setUsersDb(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // If the deleted user was the current user, log out
    if (user && user.id === id) {
      logout();
    }
    
    return true;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
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
