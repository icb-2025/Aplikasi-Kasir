import type { Barang } from "../../admin/stok-barang";

interface StokCardProps {
  item: Barang;
  onSelect: (item: Barang) => void;
}

export default function StokCard({ item, onSelect }: StokCardProps) {
  const getStockStatus = (stok: number, stokMinimal: number = 5) => {
    if (stok === 0)
      return { text: "Stok Habis", color: "bg-red-100 text-red-800" };
    if (stok <= stokMinimal)
      return { text: "Stok Terbatas", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Stok Tersedia", color: "bg-green-100 text-green-800" };
  };

  const stockStatus = getStockStatus(item.stok, item.stokMinimal);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all flex flex-col">
      {/* Gambar Barang */}
      <div className="h-48 overflow-hidden bg-gray-100">
        {item.gambarUrl ? (
          <img
            src={item.gambarUrl}
            alt={item.nama}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Ganti dengan gambar default jika gagal dimuat
              e.currentTarget.src = "../images/nostokbarang.png";
            }}
          />
        ) : (
          <img
            src="../images/nostokbarang.png"
            alt="Gambar tidak tersedia"
            className="w-full h-full object-contain p-4"
          />
        )}
      </div>
      
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}
          >
            {stockStatus.text}
          </span>
          {item.kode && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{item.kode}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {item.nama}
        </h3>
        <p className="text-sm text-gray-500 mb-3 capitalize">
          Kategori: {item.kategori}
        </p>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">Stok Tersedia</p>
            <p className="text-lg font-bold">{item.stok} unit</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Harga Jual</p>
            <p className="text-lg font-bold text-blue-600">
              Rp {item.hargaFinal?.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {item.stok > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className={`h-2 rounded-full ${
                item.stok <= (item.stokMinimal || 5) ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(100, (item.stok / 50) * 100)}%`,
              }}
            ></div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => onSelect(item)}
          className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Lihat Detail
        </button>
      </div>
    </div>
  );
}