import MenegerLayout from "./layout";
import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { portbe } from "../../../backend/ngrokbackend";
const ipbe = import.meta.env.VITE_IPBE;

import {
  DollarSign,
  ShoppingCart,
  BarChart3,
  Star,
  Award,
  Calendar
} from "lucide-react";

interface BarangTerlaris {
  nama_barang: string;
  jumlah: number;
}

interface DashboardData {
  ringkasan_penjualan: number;
  omset_penjualan: number;
  barang_terlaris: BarangTerlaris[];
}

const MenegerDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = `${ipbe}:${portbe}/api/manager/dashboard`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        setError("Gagal memuat data dashboard. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <MenegerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MenegerLayout>
    );
  }

  return (
    <MenegerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Manager
          </h2>
          <p className="text-gray-600">
            Ringkasan penjualan dan performa toko
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Pendapatan */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Pendapatan</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rp {data?.omset_penjualan?.toLocaleString("id-ID") || "0"}
              </h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Bulan ini
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Transaksi</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {data?.ringkasan_penjualan || "0"}
              </h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Bulan ini
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Rata-rata Transaksi */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Rata-rata Transaksi</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rp{" "}
                {data && data.ringkasan_penjualan && data.ringkasan_penjualan > 0
                  ? Math.round(
                      data.omset_penjualan / data.ringkasan_penjualan
                    ).toLocaleString("id-ID")
                  : "0"}
              </h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                Per transaksi
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Produk Terlaris */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Produk Terlaris</p>
              <h3
                className="text-xl font-bold text-gray-800 truncate max-w-[150px]"
                title={data?.barang_terlaris[0]?.nama_barang}
              >
                {data?.barang_terlaris[0]?.nama_barang || "-"}
              </h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {data?.barang_terlaris[0]?.jumlah || "0"} terjual
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Produk Terlaris */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Star className="h-5 w-5 text-gray-600 mr-2" />
            Produk Terlaris
          </h3>
          <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <Calendar className="h-4 w-4 mr-1" />
            Bulan ini
          </div>
        </div>

        {data?.barang_terlaris && data.barang_terlaris.length > 0 ? (
          <div className="space-y-4">
            {data.barang_terlaris.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${
                      idx === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : idx === 1
                        ? "bg-gray-100 text-gray-800"
                        : idx === 2
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <span className="font-bold text-lg">{idx + 1}</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800">
                      {item.nama_barang}
                    </h4>
                    <p className="text-sm text-gray-500 flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {item.jumlah} terjual
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      idx === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : idx === 1
                        ? "bg-gray-100 text-gray-800"
                        : idx === 2
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {idx === 0 ? (
                      <span className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        Terlaris
                      </span>
                    ) : (
                      <span>Top {idx + 1}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <Star
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
            />
            <p className="text-gray-500">
              Tidak ada data produk terlaris untuk periode ini
            </p>
          </div>
        )}
      </div>
    </MenegerLayout>
  );
};

export default MenegerDashboard;