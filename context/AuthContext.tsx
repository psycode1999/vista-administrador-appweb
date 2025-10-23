import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser: User = { id: 'admin01', name: 'Usuario Administrador', email: 'admin@marketplace.com', role: Role.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin' };
const LOCAL_STORAGE_KEY = 'marketplaceAdminUser';


export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const login = (role: Role) => {
    // Only allow Admin login for this dashboard
    if (role === Role.ADMIN) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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