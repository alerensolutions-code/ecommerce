"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('devil_gaming_auth');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Solo permitimos administradores ahora
      if (parsedUser.role === 'admin') {
        setUser(parsedUser);
      } else {
        localStorage.removeItem('devil_gaming_auth');
        setUser(null);
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Solo permitimos el acceso al administrador
    if (email === 'admin@devilgaming.com' && password === 'admin123') {
      const adminUser: User = {
        id: '0',
        username: 'devil_admin',
        name: 'Admin Principal',
        email: 'admin@devilgaming.com',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('devil_gaming_auth', JSON.stringify(adminUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devil_gaming_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
