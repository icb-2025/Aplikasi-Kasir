import { Bell, User, Menu } from "lucide-react";

import { useState } from "react";

export default function TopNav({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [userOpen, setUserOpen] = useState(false);

  return (
    <nav className="bg-white shadow px-4 py-2 flex justify-between items-center">
      {/* Mobile menu button */}
      {toggleSidebar && (
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <h1 className="text-xl font-bold text-gray-700 flex-1 text-center md:text-left">
        Beli Barang
      </h1>

      <div className="flex items-center gap-4 relative">
        {/* Notifikasi */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
            onClick={() => setUserOpen(!userOpen)}
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700 hidden sm:inline">Admin</span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Profil
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
