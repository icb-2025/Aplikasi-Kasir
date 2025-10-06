// src/auth/AuthOnlyRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface AuthOnlyRouteProps {
  children: React.ReactNode;
}

const AuthOnlyRoute: React.FC<AuthOnlyRouteProps> = ({ children }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Jika user sudah login, redirect ke dashboard sesuai role
  if (auth.user) {
    let redirectPath = '/';
    if (auth.user.role === 'admin') redirectPath = '/admin/dashboard';
    else if (auth.user.role === 'manajer') redirectPath = '/meneger/dashboard';
    else if (auth.user.role === 'kasir') redirectPath = '/kasir/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  // Jika belum login, tampilkan halaman auth
  return <>{children}</>;
};

export default AuthOnlyRoute;