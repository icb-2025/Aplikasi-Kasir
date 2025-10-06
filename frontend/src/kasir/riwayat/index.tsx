// src/meneger/riwayat/index.tsx
import { useState } from "react";
import MenegerLayout from "../layout"; // ✅ pakai layout meneger

interface RiwayatTransaksi {
  id: string;
  tanggal: string;
  items: number;
  total: number;
  status: string;
}

const KasirRiwayatPage = () => {
  const [filterBulan, setFilterBulan] = useState<string>("semua");
  const [filterTahun, setFilterTahun] = useState<string>("2023");

  const [dataRiwayat] = useState<RiwayatTransaksi[]>([
    {
      id: "TRX-M001",
      tanggal: "20 November 2023",
      items: 8,
      total: 1250000,
      status: "selesai",
    },
    {
      id: "TRX-M002",
      tanggal: "11 November 2023",
      items: 12,
      total: 2450000,
      status: "selesai",
    },
  ]);

  const formatRupiah = (angka: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

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
    <MenegerLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Riwayat Transaksi 
          </h1>
          <p className="text-gray-600">
            Lihat semua riwayat transaksi
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>

            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-500"
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
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-500"
            >
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
        </div>

        {/* Daftar riwayat */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {dataRiwayat.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dataRiwayat.map((trx) => (
                <div key={trx.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{trx.id}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            trx.status
                          )}`}
                        >
                          {trx.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{trx.tanggal}</p>
                      <p className="text-gray-600 text-sm">{trx.items} item</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatRupiah(trx.total)}
                      </p>
                      <button className="mt-2 text-sm text-blue-600 hover:underline">
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Belum ada riwayat transaksi
            </div>
          )}
        </div>
      </div>
    </MenegerLayout>
  );
};

export default KasirRiwayatPage;
