// src/admin/layout/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portbe } from "../../../../backend/ngrokbackend";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

interface MenuItem {
  name: string;
  icon: string;
  path?: string;
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  path: string;
}

interface SettingsResponse {
  storeLogo: string;
}
const ipbe = import.meta.env.VITE_IPBE;
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [marqueeKey, setMarqueeKey] = useState(0);
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);
  const location = useLocation();

  // Fetch store logo from API
  useEffect(() => {
    const fetchStoreLogo = async () => {
      try {
        const response = await fetch(`${ipbe}:${portbe}/api/admin/settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch store logo');
        }
        const data: SettingsResponse = await response.json();
        if (data.storeLogo) {
          setStoreLogo(data.storeLogo);
        }
      } catch (error) {
        console.error('Error fetching store logo:', error);
        setLogoError(true);
      }
    };

    fetchStoreLogo();
  }, []);

  // Reset animasi ketika sidebar dibuka/tutup
  useEffect(() => {
    if (isOpen) {
      setMarqueeKey(prev => prev + 1);
    }
  }, [isOpen]);

  const toggleDropdown = (menu: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeDropdown === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
    }
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    
    if (item.submenu) {
      return item.submenu.some((subItem) => 
        location.pathname === subItem.path
      );
    }
    
    return false;
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: '📊',
      submenu: [
        { name: 'Dashboard Utama', path: '/admin/dashboard' },
        { name: 'Top Barang', path: '/admin/dashboard/top-barang' },
        { name: 'Omzet', path: '/admin/dashboard/omzet' },
        { name: 'Laporan Penjualan', path: '/admin/dashboard/laporan-penjualan' },
        { name: 'Breakdown Pembayaran', path: '/admin/dashboard/breakdown-pembayaran' },
        { name: 'Transaksi', path: '/admin/dashboard/transaksi' },
      ],
    },
    // Menu Stok Barang
    {
      name: 'Stok Barang',
      icon: '📦',
      path: '/admin/stok-barang',
    },
    // Menu Status Pesanan
    {
      name: 'Status Pesanan',
      icon: '📋',
      path: '/admin/status-pesanan',
    },
    // Menu User - ditambahkan di sini
    {
      name: 'User',
      icon: '👥',
      path: '/admin/users',
    },
    // Menu Profile - ditambahkan di sini
    {
      name: 'Profile',
      icon: '👤',
      path: '/admin/profile',
    },
    {
      name: 'Settings',
      icon: '⚙️',
      path: '/admin/settings',
    },
  ];

  return (
    <>
      {/* Tombol Toggle Sidebar untuk Mobile - Fixed Position di luar sidebar */}
      

      {/* Sidebar Backdrop (for mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`bg-gradient-to-b from-orange-600 to-yellow-500 text-white w-64 fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 shadow-xl flex flex-col`}>
        {/* Logo dengan animasi - PERUBAHAN DI SINI */}
        <div className="text-white flex items-center px-4 py-5 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {storeLogo && !logoError ? (
              <div className="bg-white p-1 rounded-lg shadow-md">
                <img 
                  src={storeLogo} 
                  alt="Store Logo" 
                  className="h-8 w-8 object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="bg-white p-1.5 rounded-lg shadow-md">
                <span className="text-orange-600 text-xl font-bold">K+</span>
              </div>
            )}
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold whitespace-nowrap">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-yellow-300">
                  KasirPlus
                </span>
              </h1>
              <div className="text-xs text-orange-100 mt-0.5">
                Admin Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Toggle Sidebar untuk Mobile - di dalam sidebar */}
        <div className="md:hidden px-4 py-3 flex-shrink-0">
         
        </div>

        {/* Judul Bergerak di Sidebar dengan Animasi yang Diperbaiki */}
        <div className="px-4 py-3 bg-orange-700/30 rounded-lg mx-2 mb-4 overflow-hidden flex-shrink-0 relative">
          <div 
            key={marqueeKey}
            className="text-sm text-orange-100 whitespace-nowrap animate-marquee-smooth"
          >
            🚀 Selamat datang di Panel Admin KasirPlus - Kelola bisnis Anda dengan mudah!
          </div>
        </div>

        {/* Navigation - Area yang bisa di-scroll */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {menuItems.map((item) => (
            <div key={item.name} className="mb-2">
              {item.submenu ? (
                <div>
                  <button
                    onClick={(e) => toggleDropdown(item.name, e)}
                    className={`w-full flex justify-between items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-orange-700/60 hover:shadow-md ${isMenuActive(item) ? 'bg-orange-700/60 shadow-md' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${activeDropdown === item.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    style={{ transitionProperty: 'max-height, opacity' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="pl-10 py-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`block py-2 px-4 rounded-lg transition-all duration-200 hover:bg-orange-700/40 hover:shadow-md ${location.pathname === subItem.path ? 'bg-orange-700/40 shadow-md' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.innerWidth < 768) {
                              onClose();
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-200 mr-3"></div>
                            <span className="text-sm">{subItem.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-orange-700/60 hover:shadow-md ${location.pathname === item.path ? 'bg-orange-700/60 shadow-md' : ''}`}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>       
      </div>

      {/* Tambahkan style untuk animasi marquee yang smooth */}
      <style>{`
        @keyframes marquee-smooth {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-marquee-smooth {
          animation: marquee-smooth 15s linear infinite;
          display: inline-block;
          padding-left: 100%;
        }

        /* Untuk mobile, kurangi durasi animasi */
        @media (max-width: 768px) {
          .animate-marquee-smooth {
            animation-duration: 12s;
          }
        }

        /* Efek hover pause */
        .bg-orange-700\\/30:hover .animate-marquee-smooth {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
};

export default Sidebar;