import { Home, ShoppingCart, History, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const menu = [
    { label: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/" },
    { label: "Status Pesanan", icon: <ShoppingCart className="w-5 h-5" />, path: "/pesanan" },
    { label: "Riwayat", icon: <History className="w-5 h-5" />, path: "/riwayat" },
  ];

  return (
    <>
      {/* Toggle button untuk mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar overlay untuk mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar utama */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-gray-100 p-4 z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Menu Aplikasi Kasir</h2>
        </div>
        
        <nav className="flex flex-col gap-2">
          {menu.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700 font-semibold" : ""
                }`
              }
              onClick={() => setOpen(false)} // tutup sidebar di mobile saat klik
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}