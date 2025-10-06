import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import NotFound from '../auth/notif/404notfound'; // Import komponen NotFound

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manajer' | 'kasir')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manajer', 'kasir'] 
}) => {
  const auth = useAuth();
  const location = useLocation();

  // Menggunakan useMemo untuk menghitung keputusan redirect
  const redirectDecision = useMemo(() => {
    // Jika masih loading, tampilkan loading spinner
    if (auth.isLoading) {
      return { shouldRedirect: false, redirectPath: null, showLoading: true, showNotFound: false };
    }

    // Jika user sudah login dan mencoba akses halaman login/register
    if (auth.user && (location.pathname === '/login' || location.pathname === '/register')) {
      let path = '/';
      if (auth.user.role === 'admin') path = '/admin/dashboard';
      else if (auth.user.role === 'manajer') path = '/meneger/dashboard';
      else if (auth.user.role === 'kasir') path = '/kasir/dashboard';
      
      return { shouldRedirect: true, redirectPath: path, showLoading: false, showNotFound: false };
    }

    // Jika belum login dan mencoba akses halaman protected
    if (!auth.user) {
      // Kecualikan halaman publik yang tidak memerlukan auth
      const publicPaths = ['/', '/transaksi', '/pesanan', '/riwayat', '/pembelian-berhasil', '/login', '/register'];
      const isPublicPath = publicPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path + '/')
      );
      
      if (!isPublicPath) {
        return { shouldRedirect: false, redirectPath: null, showLoading: false, showNotFound: true };
      }
    }

    // Jika user login tapi role tidak sesuai
    if (auth.user && !allowedRoles.includes(auth.user.role)) {
      return { shouldRedirect: false, redirectPath: null, showLoading: false, showNotFound: true };
    }

    // Jika semua pengecekan lolos
    return { shouldRedirect: false, redirectPath: null, showLoading: false, showNotFound: false };
  }, [auth, location.pathname, allowedRoles]);

  // Tampilkan loading jika diperlukan
  if (redirectDecision.showLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Tampilkan halaman 404 jika diperlukan
  if (redirectDecision.showNotFound) {
    return <NotFound />;
  }

  // Lakukan redirect jika diperlukan
  if (redirectDecision.shouldRedirect && redirectDecision.redirectPath) {
    return <Navigate to={redirectDecision.redirectPath} state={{ from: location }} replace />;
  }

  // Jika semua pengecekan lolos, tampilkan children
  return <>{children}</>;
};

export default ProtectedRoute;