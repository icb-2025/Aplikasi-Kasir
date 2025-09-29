import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LayoutDashboard, ArrowLeft } from 'lucide-react';

const Admin404: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Halaman Admin Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">
          Maaf, halaman admin yang Anda cari tidak tersedia atau Anda tidak memiliki akses ke halaman ini.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          
          <button
            onClick={handleGoDashboard}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard Admin
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Kasir App. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Admin404;