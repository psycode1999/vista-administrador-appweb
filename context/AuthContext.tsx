import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<Pick<User, 'name' | 'avatarUrl'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser: User = { id: 'admin01', name: 'Usuario Administrador', email: 'admin@marketplace.com', role: Role.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin' };
const LOCAL_STORAGE_KEY = 'marketplaceAdminUser';


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : adminUser; // Start with default admin if none is stored
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return adminUser;
    }
  });

  const login = (role: Role) => {
    // Only allow Admin login for this dashboard
    if (role === Role.ADMIN) {
      const initialUser = { ...adminUser };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialUser));
      setUser(initialUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
  };
  
  const updateUser = (updatedInfo: Partial<Pick<User, 'name' | 'avatarUrl'>>) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          const newUser = { ...currentUser, ...updatedInfo };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
          return newUser;
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};