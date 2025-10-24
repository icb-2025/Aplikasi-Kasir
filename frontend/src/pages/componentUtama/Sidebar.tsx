import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../auth/context/AuthContext'
const ipbe = import.meta.env.VITE_IPBE;

// Interface untuk menu item
interface MenuItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  authRequired?: boolean;
}

// Interface untuk props Sidebar
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Interface untuk data profil
interface UserProfile {
  _id: string;
  nama_lengkap: string;
  email: string;
  username: string;
  role: string;
  profilePicture?: string;
}

// Interface untuk settings toko
interface StoreSettings {
  storeLogo?: string;
  // Tambahkan properti lain jika diperlukan
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  
  const { user, logout } = authContext;
  
  // Menu items untuk navigasi
  const menuItems: MenuItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/' },
    { id: 'status-pesanan', name: 'Riwayat', icon: '📋', path: '/pesanan', authRequired: true },
    { id: 'profile', name: 'Profile', icon: '👤', path: '/profile', authRequired: true },
  ];

  // Filter menu items berdasarkan status autentikasi
  const filteredMenuItems = menuItems.filter(item => {
    if (item.authRequired && !user) {
      return false;
    }
    return true;
  });

  // Fetch data profil pengguna
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${ipbe}:5000/api/update-profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const profileData: UserProfile = await response.json();
            setUserProfile(profileData);
            console.log("Profile data:", profileData); // Debugging
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Fetch logo toko
  useEffect(() => {
    const fetchStoreLogo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ipbe}:5000/api/admin/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const settingsData: StoreSettings = await response.json();
          if (settingsData.storeLogo) {
            // Jika storeLogo adalah path relatif, tambahkan base URL
            const logoUrl = settingsData.storeLogo.startsWith('http') 
              ? settingsData.storeLogo 
              : `${ipbe}:5000${settingsData.storeLogo}`;
            setStoreLogo(logoUrl);
            console.log("Store logo:", logoUrl); // Debugging
          }
        } else {
          console.error('Failed to fetch store settings');
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
      } finally {
        setLoadingLogo(false);
      }
    };
    
    fetchStoreLogo();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      if (window.innerWidth < 768) {
        onToggle();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  // Fungsi untuk mendapatkan URL gambar profil
  const getProfilePictureUrl = (profilePicture?: string) => {
    if (!profilePicture) return null;
    
    // Jika profilePicture sudah URL lengkap (dimulai dengan http), gunakan langsung
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    
    // Jika profilePicture adalah path relatif, tambahkan base URL
    return `${ipbe}:5000${profilePicture}`;
  };

  return (
    <>
      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Tombol tutup untuk mobile */}
          <div className="md:hidden p-4 border-b border-gray-200 flex justify-end">
            <button 
              onClick={onToggle}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
                    {/* Logo dan Nama Toko */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {loadingLogo ? (
                <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse"></div>
              ) : storeLogo && !logoError ? (
                <img 
                  src={storeLogo} 
                  alt="Store Logo" 
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                  onError={handleLogoError}
                />
              ) : (
                <div className="bg-amber-500 p-3 rounded-xl shadow-md">
                  <span className="text-white text-2xl font-bold">K+</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-800">KasirPlus</h1>
                <p className="text-xs text-gray-500">Point of Sale System</p>
              </div>
            </div>
          </div>
          
          {/* User Info (jika sudah login) */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {loadingProfile ? (
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                ) : (
                  <>
                    {(() => {
                      const profilePictureUrl = getProfilePictureUrl(userProfile?.profilePicture);
                      return profilePictureUrl && !imageError ? (
                        <img 
                          src={profilePictureUrl} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="bg-blue-100 p-2 rounded-full">
                          <span className="text-blue-600 text-lg">👤</span>
                        </div>
                      );
                    })()}
                  </>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.nama_lengkap || user.nama_lengkap || 'Pengguna'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userProfile?.role || user.role || 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigasi Menu */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</h2>
            <div className="space-y-1">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 768) {
                      onToggle();
                    }
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
              
              {/* Menu Login/Logout */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 text-gray-700 hover:bg-red-50"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    if (window.innerWidth < 768) {
                      onToggle();
                    }
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                    location.pathname === '/login'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-xl">🔑</span>
                  <span className="font-medium">Login</span>
                </button>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Information</h3>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Tips:</span> Gunakan kategori di atas untuk memfilter produk.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">© 2023 KasirPlus</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;