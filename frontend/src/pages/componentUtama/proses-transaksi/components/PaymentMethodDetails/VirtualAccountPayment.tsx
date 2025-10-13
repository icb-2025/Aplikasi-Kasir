// VirtualAccountPayment.tsx
import { useState } from "react";
import { Copy, Check, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

interface VirtualAccountPaymentProps {
  metodePembayaran?: string;
  totalHarga?: number;
  noVa?: string;
  permataVaNumber?: string;
  vaNumber?: string;
  status?: string;
  vaNumbers?: Array<{ bank: string; va_number: string }>;
}

const VirtualAccountPayment: React.FC<VirtualAccountPaymentProps> = ({
  metodePembayaran,
  totalHarga,
  noVa,
  permataVaNumber,
  vaNumber,
  status,
  vaNumbers
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);

  const getVaNumber = (): string => {
    if (vaNumbers && vaNumbers.length > 0 && selectedBankIndex < vaNumbers.length) {
      return vaNumbers[selectedBankIndex].va_number;
    }
    
    return noVa || permataVaNumber || vaNumber || "-";
  };

  const getBankName = (): string => {
    if (vaNumbers && vaNumbers.length > 0 && selectedBankIndex < vaNumbers.length) {
      return vaNumbers[selectedBankIndex].bank;
    }
    
    return metodePembayaran?.replace("Virtual Account", "").trim() || "Bank";
  };

  const vaNumberDisplay = getVaNumber();
  const bankName = getBankName();

  const copyToClipboard = () => {
    if (vaNumberDisplay && vaNumberDisplay !== "-") {
      navigator.clipboard.writeText(vaNumberDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('id-ID');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'selesai':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'expire':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expire':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Pembayaran Virtual Account</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Metode Pembayaran</p>
            <p className="font-medium">{metodePembayaran || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Pembayaran</p>
            <p className="font-medium text-lg">
              Rp {formatNumber(totalHarga)}
            </p>
          </div>
        </div>
        
        {vaNumbers && vaNumbers.length > 1 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Pilih Bank:</p>
            <div className="flex flex-wrap gap-2">
              {vaNumbers.map((va, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedBankIndex(index)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    selectedBankIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {va.bank}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-blue-800">
              Nomor Virtual Account {bankName && `(${bankName})`}:
            </p>
            <button
              onClick={copyToClipboard}
              disabled={vaNumberDisplay === "-" || copied}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Salin
                </>
              )}
            </button>
          </div>
          <p className="text-xl font-mono font-bold text-blue-900 break-all">
            {vaNumberDisplay}
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">Cara Pembayaran:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-yellow-700">
            <li>Buka aplikasi mobile banking atau ATM bank Anda</li>
            <li>Pilih menu Transfer atau Pembayaran</li>
            <li>Pilih menu Virtual Account</li>
            <li>Masukkan nomor Virtual Account di atas</li>
            <li>Konfirmasi pembayaran dengan jumlah yang benar</li>
            <li>Simpan bukti pembayaran Anda</li>
          </ol>
          <p className="mt-2 text-xs text-yellow-600">
            <strong>Penting:</strong> Pembayaran akan diproses secara otomatis setelah Anda melakukan transfer. 
            Jika pembayaran tidak terdeteksi dalam 5 menit, silakan klik tombol "Cek Status Pembayaran".
          </p>
        </div>
        
        {status && (
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            Status Pembayaran: {status === 'selesai' ? 'Berhasil' : status === 'pending' ? 'Menunggu Pembayaran' : status === 'expire' ? 'Kadaluarsa' : status}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualAccountPayment;