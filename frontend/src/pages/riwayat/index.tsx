import { useState } from "react";
import MainLayout from "../../components/MainLayout";

// Interface untuk data riwayat transaksi
interface RiwayatTransaksi {
  id: string;
  tanggal: string;
  items: number;
  total: number;
  status: string;
}

const RiwayatPage = () => {
  const [filterBulan, setFilterBulan] = useState<string>("semua");
  const [filterTahun, setFilterTahun] = useState<string>("2023");

  // Data dummy untuk riwayat transaksi
  const [dataRiwayat] = useState<RiwayatTransaksi[]>([
    {
      id: "TRX-001",
      tanggal: "15 November 2023",
      items: 3,
      total: 450000,
      status: "selesai"
    },
    {
      id: "TRX-002",
      tanggal: "10 November 2023",
      items: 5,
      total: 780000,
      status: "selesai"
    },
    {
      id: "TRX-003",
      tanggal: "5 November 2023",
      items: 2,
      total: 220000,
      status: "selesai"
    },
    {
      id: "TRX-004",
      tanggal: "28 Oktober 2023",
      items: 4,
      total: 560000,
      status: "selesai"
    },
    {
      id: "TRX-005",
      tanggal: "20 Oktober 2023",
      items: 1,
      total: 150000,
      status: "selesai"
    }
  ]);

  // Fungsi untuk memformat angka ke format Rupiah
  const formatRupiah = (angka: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Fungsi untuk mendapatkan warna berdasarkan status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "selesai":
        return "bg-green-100 text-green-800";
      case "diproses":
        return "bg-yellow-100 text-yellow-800";
      case "dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Transaksi</h1>
          <p className="text-gray-600">Lihat riwayat transaksi dan pembelian Anda</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="semua">Semua Bulan</option>
                <option value="januari">Januari</option>
                <option value="februari">Februari</option>
                <option value="maret">Maret</option>
                <option value="april">April</option>
                <option value="mei">Mei</option>
                <option value="juni">Juni</option>
                <option value="juli">Juli</option>
                <option value="agustus">Agustus</option>
                <option value="september">September</option>
                <option value="oktober">Oktober</option>
                <option value="november">November</option>
                <option value="desember">Desember</option>
              </select>

              <select 
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daftar Riwayat Transaksi */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {dataRiwayat.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dataRiwayat.map((transaksi) => (
                <div key={transaksi.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{transaksi.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaksi.status)}`}>
                          {transaksi.status.charAt(0).toUpperCase() + transaksi.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{transaksi.tanggal}</p>
                      <p className="text-gray-600 text-sm">{transaksi.items} item</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatRupiah(transaksi.total)}</p>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada transaksi</h3>
              <p className="text-gray-500 mb-6">Transaksi yang Anda lakukan akan muncul di halaman ini.</p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Kembali Berbelanja
              </button>
            </div>
          )}
        </div>

        {/* Informasi Tambahan */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2">Informasi:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Riwayat transaksi akan tersimpan selama 2 tahun</li>
            <li>• Anda dapat mengunduh invoice untuk setiap transaksi</li>
            <li>• Untuk bantuan terkait transaksi, hubungi customer service</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default RiwayatPage;