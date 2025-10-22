import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser: User = { id: 'admin01', name: 'Usuario Administrador', email: 'admin@marketplace.com', role: Role.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin' };

// Fix: Updated AuthProvider to use React.PropsWithChildren for its props type to resolve typing issues.
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    // Only allow Admin login for this dashboard
    if (role === Role.ADMIN) {
      setUser(adminUser);
    }
  };

  const logout = () => {
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