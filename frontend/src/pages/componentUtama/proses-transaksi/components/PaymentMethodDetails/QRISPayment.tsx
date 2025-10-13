import { Loader2, AlertCircle } from "lucide-react";

interface QRISPaymentProps {
  metodePembayaran?: string;
  totalHarga?: number;
  qrCodeUrl: string;
  qrCodeLoading: boolean;
  qrCodeError: boolean;
}

const getSafeValue = (value: string | number | null | undefined, defaultValue: string = ""): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value.toLocaleString("id-ID");
  return value;
};

const QRISPayment: React.FC<QRISPaymentProps> = ({
  metodePembayaran,
  totalHarga,
  qrCodeUrl,
  qrCodeLoading,
  qrCodeError
}) => {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">Pembayaran QRIS</h3>
      
      <div className="bg-white rounded-lg p-4 border border-purple-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Metode Pembayaran</p>
            <p className="font-medium text-lg">
              {getSafeValue(metodePembayaran)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Pembayaran</p>
            <p className="font-medium text-lg">
              Rp {getSafeValue(totalHarga, "0")}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          {qrCodeLoading ? (
            <div className="flex justify-center items-center h-64 w-full">
              <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
            </div>
          ) : qrCodeError ? (
            <div className="flex flex-col items-center justify-center h-64 w-full">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <p className="text-gray-500 text-center">QR Code tidak dapat dimuat. Silakan gunakan URL pembayaran di bawah ini.</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code Pembayaran" 
                    className="w-64 h-64 object-contain"
                    onError={() => {
                      console.error("Error loading QR Code image");
                      qrCodeError = true;
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">QR Code tidak tersedia</p>
                  </div>
                )}
              </div>
              
              {/* Tampilkan URL pembayaran */}
              {qrCodeUrl && (
                <div className="mt-4 w-full max-w-md">
                  <p className="text-sm text-gray-600 mb-1">URL Pembayaran:</p>
                  <div className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <a 
                      href={qrCodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {qrCodeUrl}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Klik URL di atas untuk membuka halaman pembayaran
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Cara Pembayaran:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Buka aplikasi e-wallet atau mobile banking Anda</li>
            <li>Pilih menu Bayar atau Scan</li>
            <li>Scan QR Code yang ditampilkan di atas atau klik URL pembayaran</li>
            <li>Konfirmasi pembayaran dengan jumlah yang benar</li>
            <li>Simpan bukti pembayaran Anda</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRISPayment;