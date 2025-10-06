// src/admin/layout/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onToggle }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

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
    icon: '👤',
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
      {/* Sidebar Backdrop (for mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 shadow-xl flex flex-col`}>
        {/* Logo dengan animasi */}
        <div className="text-white flex items-center justify-between px-4 py-5 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-lg shadow-md">
              <span className="text-blue-800 text-xl font-bold">K+</span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold whitespace-nowrap">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">
                  KasirPlus
                </span>
              </h1>
              <div className="text-xs text-blue-200 mt-0.5">
                Admin Dashboard
              </div>
            </div>
          </div>
          {/* Tombol close untuk mobile */}
          <button 
            className="md:hidden text-white focus:outline-none p-1 rounded-full hover:bg-blue-700 transition-colors"
            onClick={onClose}
            aria-label="Tutup sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tombol Toggle Sidebar untuk Mobile - di dalam sidebar */}
        <div className="md:hidden px-4 py-3 flex-shrink-0">
          <button 
            className="w-full flex items-center justify-center py-2 bg-blue-700/50 rounded-lg text-white hover:bg-blue-700 transition-colors"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span>{isOpen ? 'Tutup Menu' : 'Buka Menu'}</span>
          </button>
        </div>

        {/* Judul Bergerak di Sidebar */}
        <div className="px-4 py-3 bg-blue-700/30 rounded-lg mx-2 mb-4 overflow-hidden flex-shrink-0">
          <div className="text-sm text-blue-200 whitespace-nowrap animate-marquee">
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
                    className={`w-full flex justify-between items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/60 hover:shadow-md ${isMenuActive(item) ? 'bg-blue-700/60 shadow-md' : ''}`}
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
                          className={`block py-2 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/40 hover:shadow-md ${location.pathname === subItem.path ? 'bg-blue-700/40 shadow-md' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.innerWidth < 768) {
                              onClose();
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-200 mr-3"></div>
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
                  className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700/60 hover:shadow-md ${location.pathname === item.path ? 'bg-blue-700/60 shadow-md' : ''}`}
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
    </>
  );
};

export default Sidebar;