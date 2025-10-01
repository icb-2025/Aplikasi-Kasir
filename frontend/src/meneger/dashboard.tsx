import MenegerLayout from "./layout";
import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

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
  const [timeRange, setTimeRange] = useState("monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `http://192.168.110.16:5000/api/manager/dashboard?range=${timeRange}`;
        
        if (timeRange === "custom" && customStartDate && customEndDate) {
          url += `&start_date=${customStartDate}&end_date=${customEndDate}`;
        }
        
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
  }, [timeRange, customStartDate, customEndDate]);

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      if (new Date(customStartDate) > new Date(customEndDate)) {
        setError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
        return;
      }
      setError(null);
      setTimeRange("custom");
    }
  };

  const formatDateRangeText = () => {
    if (timeRange === "custom" && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })} - ${new Date(customEndDate).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`;
    }
    
    return timeRange === "daily"
      ? "Hari ini"
      : timeRange === "weekly"
      ? "Minggu ini"
      : "Bulan ini";
  };

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

        {/* Filter Periode */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["daily", "weekly", "monthly", "custom"].map((range) => (
              <button
                key={range}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => {
                  if (range === "custom") {
                    setShowCustomDate(true);
                  } else {
                    setShowCustomDate(false);
                    setTimeRange(range);
                  }
                }}
              >
                {range === "daily"
                  ? "Harian"
                  : range === "weekly"
                  ? "Mingguan"
                  : range === "monthly"
                  ? "Bulanan"
                  : "Kustom"}
              </button>
            ))}
          </div>
          
          {/* Custom Date Picker */}
          {showCustomDate && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <button
                onClick={handleCustomDateApply}
                disabled={!customStartDate || !customEndDate}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !customStartDate || !customEndDate
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Terapkan
              </button>
            </div>
          )}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateRangeText()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateRangeText()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Per transaksi
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {data?.barang_terlaris[0]?.jumlah || "0"} terjual
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Produk Terlaris */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Produk Terlaris
          </h3>
          <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateRangeText()}
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L3 12l5.714-2.143L13 3z" />
                        </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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