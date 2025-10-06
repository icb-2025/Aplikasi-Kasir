import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import NotFound from '../auth/notif/404notfound';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manajer' | 'kasir')[];
  requireAuth?: boolean; // Tambahkan prop untuk menentukan apakah route memerlukan autentikasi
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manajer', 'kasir'],
  requireAuth = false // Default tidak memerlukan autentikasi
}) => {
  const auth = useAuth();
  const location = useLocation();

  const redirectDecision = useMemo(() => {
    if (auth.isLoading) {
      return { shouldRedirect: false, redirectPath: null, showLoading: true, showNotFound: false };
    }

    if (auth.user && (location.pathname === '/login' || location.pathname === '/register')) {
      let path = '/';
      if (auth.user.role === 'admin') path = '/admin/dashboard';
      else if (auth.user.role === 'manajer') path = '/meneger/dashboard';
      else if (auth.user.role === 'kasir') path = '/kasir/dashboard';
      
      return { shouldRedirect: true, redirectPath: path, showLoading: false, showNotFound: false };
    }

    // Jika route memerlukan autentikasi dan user belum login
    if (requireAuth && !auth.user) {
      return { shouldRedirect: true, redirectPath: '/login', showLoading: false, showNotFound: false };
    }

    if (!auth.user) {
      // Path publik yang bisa diakses tanpa login
      const publicPaths = ['/', '/transaksi', '/login', '/register'];
      
      // Path yang memerlukan login
      const authRequiredPaths = ['/pesanan', '/riwayat'];
      
      const isPublicPath = publicPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path + '/')
      );
      
      const isAuthRequiredPath = authRequiredPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path + '/')
      );
      
      // Jika path memerlukan login, redirect ke halaman login
      if (isAuthRequiredPath) {
        return { shouldRedirect: true, redirectPath: '/login', showLoading: false, showNotFound: false };
      }
      
      // Jika bukan path publik, tampilkan halaman not found
      if (!isPublicPath) {
        return { shouldRedirect: false, redirectPath: null, showLoading: false, showNotFound: true };
      }
    }

    if (auth.user && !allowedRoles.includes(auth.user.role)) {
      return { shouldRedirect: false, redirectPath: null, showLoading: false, showNotFound: true };
    }

    return { shouldRedirect: false, redirectPath: null, showLoading: false, showNotFound: false };
  }, [auth, location.pathname, allowedRoles, requireAuth]);

  if (redirectDecision.showLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (redirectDecision.showNotFound) {
    return <NotFound />;
  }

  if (redirectDecision.shouldRedirect && redirectDecision.redirectPath) {
    return <Navigate to={redirectDecision.redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;