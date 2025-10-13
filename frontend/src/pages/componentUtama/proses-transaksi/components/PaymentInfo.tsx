// PaymentInfo.tsx
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import SweetAlert from "../../../../components/SweetAlert";

interface PaymentInfoProps {
  nomorTransaksi?: string;
  tanggalTransaksi?: string;
  metodePembayaran?: string;
  hargaFinal?: number;
}

const getSafeValue = (value: string | number | null | undefined, defaultValue: string = ""): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value.toLocaleString("id-ID");
  return value;
};

// Format tanggal dengan aman
const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  
  try {
    // Coba parse tanggal
    const date = new Date(dateString);
    
    // Periksa apakah tanggal valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "-";
    }
    
    // Format tanggal dengan opsi yang jelas
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "-";
  }
};

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  nomorTransaksi,
  tanggalTransaksi,
  metodePembayaran,
  hargaFinal
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
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
      
      setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">Informasi Pembayaran</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Nomor Transaksi</p>
            {nomorTransaksi && nomorTransaksi !== "-" && (
              <button
                onClick={() => copyToClipboard(nomorTransaksi, "Nomor Transaksi")}
                className="text-blue-600 hover:text-blue-800"
                title="Salin Nomor Transaksi"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          <p className="font-medium">{nomorTransaksi || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tanggal Transaksi</p>
          <p className="font-medium">{formatDate(tanggalTransaksi)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Metode Pembayaran</p>
          <p className="font-medium">{metodePembayaran || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Pembayaran</p>
          <p className="font-medium text-lg">
            Rp {getSafeValue(hargaFinal, "0")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;