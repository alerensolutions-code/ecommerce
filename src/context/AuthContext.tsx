"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efecto adicional para evitar deadlocks de loading al navegar a la tienda
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleRouteChange = () => {
      const path = window.location.pathname;
      // Si salimos de admin y seguimos cargando, forzamos el apagado tras 1s
      if (!path.startsWith('/admin') && loading) {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // Ejecutar al cargar/navegar

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [loading]);

  useEffect(() => {
    let mounted = true;

    // PARACAÍDAS: Si en 5 segundos no hay respuesta, forzamos el fin del loading.
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("DEBUG: Timeout de seguridad activado en AuthContext.");
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        // Con @supabase/ssr, getSession sincroniza automáticamente con las cookies del navegador
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session) {
          await verifyAdminProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session) {
        await verifyAdminProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const verifyAdminProfile = async (supabaseUser: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', supabaseUser.id)
        .single();

      if (error || !profile || !profile.is_admin) {
        await supabase.auth.signOut();
        setUser(null);
        return false;
      }

      const appUser: User = {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'admin',
        name: supabaseUser.user_metadata?.full_name || 'Admin Principal',
        email: supabaseUser.email || '',
        role: 'admin'
      };
      setUser(appUser);
      return true;

    } catch (err) {
      console.error('Error verifying admin status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 🚩 LIMPIEZA DE GHOST TOKENS: Eliminamos rastro de versiones antiguas o conflictos
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tokenData');
        localStorage.removeItem('devil_gaming_auth');
        // También limpiamos cookies antiguas si existieran
        document.cookie = "tokenData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }

      // Limpiar rastro de sesión de Supabase anterior
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      });

      if (error) {
        console.error('DEBUG: Error de autenticación Supabase:', error.message, error.status);
        setLoading(false);
        return false;
      }

      if (!data?.user) {
        setLoading(false);
        return false;
      }

      const isAdmin = await verifyAdminProfile(data.user);
      return isAdmin;
    } catch (err) {
      console.error('DEBUG: Error inesperado en login:', err);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
