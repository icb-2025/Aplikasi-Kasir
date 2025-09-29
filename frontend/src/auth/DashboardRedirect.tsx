import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import PublicHome from '../pages/PublicHome';
import type { Barang } from '../admin/stok-barang';

interface DashboardRedirectProps {
  dataBarang: Barang[];
}

const DashboardRedirect: React.FC<DashboardRedirectProps> = ({ dataBarang }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.user) {
        // Redirect ke dashboard sesuai role
        switch (auth.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'manajer': // Perbaikan: manajer bukan manager
            navigate('/meneger/dashboard');
            break;
          case 'kasir':
            navigate('/kasir/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [auth.user, auth.isLoading, navigate]);

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Tampilkan halaman publik jika tidak login
  return <PublicHome dataBarang={dataBarang} />;
};

export default DashboardRedirect;