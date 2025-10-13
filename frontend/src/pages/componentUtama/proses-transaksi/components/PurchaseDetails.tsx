// PurchaseDetails.tsx
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import SweetAlert from "../../../../components/SweetAlert";

interface BarangDibeli {
  kode_barang: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  harga_beli: number;
  subtotal: number;
  _id: string;
  gambar_url?: string;
}

interface PurchaseDetailsProps {
  barangDibeli?: BarangDibeli[];
}

const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({ barangDibeli }) => {
  const [safeBarangDibeli, setSafeBarangDibeli] = useState<BarangDibeli[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  useEffect(() => {
    // Validasi data sebelum digunakan
    if (barangDibeli && Array.isArray(barangDibeli) && barangDibeli.length > 0) {
      const validItems = barangDibeli.filter(item => 
        item && 
        typeof item === 'object' && 
        'nama_barang' in item && 
        'jumlah' in item && 
        'subtotal' in item &&
        'harga_satuan' in item
      );
      
      // Normalisasi data untuk memastikan semua field ada
      const normalizedItems = validItems.map(item => ({
        ...item,
        harga_satuan: item.harga_satuan || 0,
        subtotal: item.subtotal || 0
      }));
      
      setSafeBarangDibeli(normalizedItems);
    } else {
      setSafeBarangDibeli([]);
    }
  }, [barangDibeli]);

  // Format angka dengan aman
  const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('id-ID');
  };

  const copyToClipboard = async (text: string, label: string, itemId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId || text);
      
      // Tampilkan notifikasi sukses
      await SweetAlert.fire({
        title: 'Berhasil Disalin!',
        text: `${label} telah disalin ke clipboard.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
      
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
      
      // Tampilkan notifikasi error
      await SweetAlert.fire({
        title: 'Gagal Menyalin!',
        text: `Terjadi kesalahan saat menyalin ${label}.`,
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    }
  };

  const copyAllItems = async () => {
    if (safeBarangDibeli.length === 0) return;
    
    const text = safeBarangDibeli.map(item => 
      `${item.nama_barang} - Jumlah: ${item.jumlah} - Harga: Rp ${formatNumber(item.harga_satuan)} - Subtotal: Rp ${formatNumber(item.subtotal)}`
    ).join('\n');
    
    await copyToClipboard(text, "Detail Barang");
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Detail Pembelian</h3>
        {safeBarangDibeli.length > 0 && (
          <button
            onClick={copyAllItems}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {copiedItem === 'all' ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Tersalin
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Salin Semua
              </>
            )}
          </button>
        )}
      </div>
      
      {safeBarangDibeli.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Satuan
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeBarangDibeli.map((item, index) => (
                <tr key={item._id || index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.nama_barang || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(item.jumlah)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    Rp {formatNumber(item.harga_satuan)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    Rp {formatNumber(item.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <button
                      onClick={() => copyToClipboard(
                        `${item.nama_barang} - Jumlah: ${item.jumlah} - Harga: Rp ${formatNumber(item.harga_satuan)} - Subtotal: Rp ${formatNumber(item.subtotal)}`,
                        "Detail Barang",
                        item._id || index.toString()
                      )}
                      className="text-blue-600 hover:text-blue-800"
                      title="Salin Detail Barang"
                    >
                      {copiedItem === (item._id || index.toString()) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
          </div>
          <p className="text-gray-500">Tidak ada detail barang</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseDetails;