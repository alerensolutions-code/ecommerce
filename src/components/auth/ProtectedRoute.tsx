"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Basic client-side redirect
    // A more robust app would do this in Next.js middleware.ts using cookies
    if (!isAuthenticated) {
      router.push('/login');
    } else if (adminOnly && user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, adminOnly, user, router, loading]);

  if (loading || !isAuthenticated || (adminOnly && user?.role !== 'admin')) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
