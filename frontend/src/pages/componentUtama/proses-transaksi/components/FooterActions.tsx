import { Loader2 } from "lucide-react";

interface FooterActionsProps {
  isCancelling: boolean;
  isCheckingStatus: boolean;
  isExpired: boolean;
  onPaymentCancel: () => void;
  onPaymentWithMidtrans: () => void;
  paymentType?: 'va' | 'qris' | 'tunai' | null;
  transactionStatus?: string;
}

const FooterActions: React.FC<FooterActionsProps> = ({
  isCancelling,
  isCheckingStatus,
  isExpired,
  onPaymentCancel,
  onPaymentWithMidtrans,
  paymentType,
  transactionStatus
}) => {
  // Jika status sudah selesai, tampilkan pesan sukses
  if (transactionStatus === 'selesai') {
    return (
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex justify-center">
          <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Pembayaran Berhasil
          </div>
        </div>
      </div>
    );
  }

  // Jika status pending, tampilkan pesan pending dengan tombol aksi
  if (transactionStatus === 'pending') {
    return (
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Menunggu Pembayaran
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onPaymentCancel}
              disabled={isCancelling || isCheckingStatus}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Membatalkan...
                </>
              ) : (
                "Batal"
              )}
            </button>
            <button
              onClick={onPaymentWithMidtrans}
              disabled={isCheckingStatus || isExpired || isCancelling}
              className={`px-6 py-3 text-white rounded-lg disabled:bg-gray-400 flex items-center justify-center ${
                paymentType === 'va' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Mengecek Status...
                </>
              ) : isExpired ? (
                "Waktu Habis"
              ) : paymentType === 'va' ? (
                "Cek Status Pembayaran"
              ) : (
                "Proses Pembayaran"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jika status expire, tampilkan pesan kadaluarsa
  if (transactionStatus === 'expire' || isExpired) {
    return (
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Pembayaran Kadaluarsa
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onPaymentCancel}
              disabled={isCancelling || isCheckingStatus}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Membatalkan...
                </>
              ) : (
                "Kembali ke Halaman Transaksi"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jika status cancel atau deny, tampilkan pesan pembatalan
  if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
    return (
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Pembayaran Dibatalkan
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onPaymentCancel}
              disabled={isCancelling || isCheckingStatus}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Membatalkan...
                </>
              ) : (
                "Kembali ke Halaman Transaksi"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jika status tidak dikenal, tampilkan status dengan tombol aksi default
  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="px-6 py-3 bg-blue-100 text-blue-800 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Status: {transactionStatus || 'Menunggu Pembayaran'}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onPaymentCancel}
            disabled={isCancelling || isCheckingStatus}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 flex items-center justify-center"
          >
            {isCancelling ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Membatalkan...
              </>
            ) : (
              "Batal"
            )}
          </button>
          <button
            onClick={onPaymentWithMidtrans}
            disabled={isCheckingStatus || isExpired || isCancelling}
            className={`px-6 py-3 text-white rounded-lg disabled:bg-gray-400 flex items-center justify-center ${
              paymentType === 'va' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Mengecek Status...
              </>
            ) : isExpired ? (
              "Waktu Habis"
            ) : paymentType === 'va' ? (
              "Cek Status Pembayaran"
            ) : (
              "Proses Pembayaran"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FooterActions;