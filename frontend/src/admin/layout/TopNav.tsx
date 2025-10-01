import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth'; // Perbaiki path

const TopNav: React.FC = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    // Gunakan fungsi logout dari AuthContext
    logout();
  };

  // Mendapatkan inisial nama, gunakan username jika nama_lengkap tidak tersedia
  const getInitial = () => {
    if (user?.nama_lengkap) {
      return user.nama_lengkap.charAt(0);
    }
    return user?.username?.charAt(0) || 'A';
  };

  // Mendapatkan nama tampilan, gunakan username jika nama_lengkap tidak tersedia
  const getDisplayName = () => {
    return user?.nama_lengkap || user?.username || 'Admin';
  };

  return (
    <header className="bg-white shadow-sm z-10 border-b border-gray-200">
      <div className="flex items-center justify-between py-3 px-4 md:px-6">
        <div className="flex items-center">
          {/* Judul saja tanpa tombol toggle */}
          <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">

          <div className="relative">
            <button 
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 hover:bg-gray-100 transition-colors"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                {getInitial()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{getDisplayName()}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              <svg className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <Link 
                  to="/admin/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;