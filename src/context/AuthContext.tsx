import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('devil_gaming_auth');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Mock validation for demo
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
    
    if (email === 'user@example.com' && password === 'password') {
      const mockUser: User = {
        id: '1',
        username: 'devil_fan',
        name: 'Gamer Pro',
        email: 'user@example.com',
        role: 'customer'
      };
      setUser(mockUser);
      localStorage.setItem('devil_gaming_auth', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, _password: string): boolean => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
      email: email,
      role: 'customer'
    };
    setUser(newUser);
    localStorage.setItem('devil_gaming_auth', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devil_gaming_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
