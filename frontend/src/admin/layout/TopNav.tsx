import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const TopNav: React.FC = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return; // prevent double clicks
    setIsLoggingOut(true);
    try {
      // Tutup dropdown
      setProfileDropdownOpen(false);

      // Panggil fungsi logout dari AuthContext
      // Call logout (which now clears local storage immediately). We navigate
      // right after calling it so the UI moves to login without waiting for
      // network roundtrips.
      await logout();

      // Navigate to login using replace so user can't go back to protected routes
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Mendapatkan inisial nama, gunakan username jika nama_lengkap tidak tersedia
  const getInitial = () => {
    if (user?.nama_lengkap) {
      return user.nama_lengkap.charAt(0);
    }
    return user?.username?.charAt(0) ?? 'A';
  };

  // Mendapatkan nama tampilan, gunakan username jika nama_lengkap tidak tersedia
  const getDisplayName = () => {
    return user?.nama_lengkap || user?.username || 'Admin';
  };

  return (
    <header className="bg-white shadow-sm z-10 border-b border-gray-200">
      <div className="flex items-center justify-between py-3 px-4 md:px-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1 hover:bg-orange-50 transition-colors"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
              disabled={isLoggingOut}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-md">
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
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 flex items-center"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 flex items-center disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Logout
                    </>
                  )}
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