interface CashPaymentProps {
  metodePembayaran?: string;
  totalHarga?: number;
}

const getSafeValue = (value: string | number | null | undefined, defaultValue: string = ""): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value.toLocaleString("id-ID");
  return value;
};

const CashPayment: React.FC<CashPaymentProps> = ({
  metodePembayaran,
  totalHarga
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Pembayaran Tunai</h3>
      
      <div className="bg-white rounded-lg p-4 border border-green-300">
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
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Cara Pembayaran:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Silakan bayar langsung di kasir</li>
            <li>Menunjukkan nomor transaksi kepada kasir</li>
            <li>Simpan bukti pembayaran Anda</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CashPayment;