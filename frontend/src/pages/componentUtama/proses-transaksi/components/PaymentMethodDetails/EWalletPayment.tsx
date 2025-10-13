import { Loader2, AlertCircle, Smartphone, QrCode, ExternalLink } from "lucide-react";

interface EWalletPaymentProps {
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

const EWalletPayment: React.FC<EWalletPaymentProps> = ({
  metodePembayaran,
  totalHarga,
  qrCodeUrl,
  qrCodeLoading,
  qrCodeError
}) => {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 p-2 rounded-lg mr-3">
          <Smartphone className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-purple-800">Pembayaran QRIS</h3>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-purple-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Metode Pembayaran</p>
            <p className="font-medium text-lg">
              {getSafeValue(metodePembayaran)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Pembayaran</p>
            <p className="font-medium text-lg text-purple-700">
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
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 mb-6">
                {qrCodeUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm mb-3">
                      <QrCode className="w-8 h-8 text-purple-600" />
                    </div>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code Pembayaran" 
                      className="w-56 h-56 object-contain"
                      onError={() => {
                        console.error("Error loading QR Code image");
                        qrCodeError = true;
                      }}
                    />
                    <p className="text-sm text-gray-500 mt-2">Scan QR Code dengan aplikasi E-Wallet</p>
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-gray-100 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">QR Code tidak tersedia</p>
                  </div>
                )}
              </div>
              
              {/* Tampilkan URL pembayaran */}
              {qrCodeUrl && (
                <div className="mt-4 w-full max-w-md">
                  <div className="flex items-center mb-2">
                    <ExternalLink className="w-4 h-4 text-purple-600 mr-2" />
                    <p className="text-sm font-medium text-gray-700">URL Pembayaran:</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <a 
                      href={qrCodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 break-all text-sm font-medium"
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
        
        <div className="mt-6 bg-purple-100 rounded-lg p-4">
          <p className="font-medium text-purple-800 mb-3">Cara Pembayaran:</p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
            <li>Buka aplikasi E-Wallet Anda (GoPay, OVO, DANA, ShopeePay, dll)</li>
            <li>Pilih menu <span className="font-medium">Bayar</span> atau <span className="font-medium">Scan</span></li>
            <li>Scan QR Code yang ditampilkan di atas atau klik URL pembayaran</li>
            <li>Konfirmasi pembayaran dengan jumlah yang benar</li>
            <li>Simpan bukti pembayaran Anda</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EWalletPayment;