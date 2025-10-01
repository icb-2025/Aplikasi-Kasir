// src/pages/transaksi/proses-transaksi/components/PaymentInfo.tsx
import { formatDate } from "./../../utils/formatDate";

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

interface TransactionResponse {
  _id: string;
  order_id: string;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  barang_dibeli: BarangDibeli[];
  total_harga: number;
  metode_pembayaran: string;
  status: string;
  kasir_id?: string;
  createdAt: string;
  updatedAt: string;
  no_va?: string;
}

interface PaymentInfoProps {
  transaksi: TransactionResponse | null;
  paymentStatus: string;
}

const PaymentInfo = ({ transaksi, paymentStatus }: PaymentInfoProps) => {
  const getStatusBadge = () => {
    let statusText = "Status Tidak Diketahui";
    let badgeClass = "bg-gray-100 text-gray-800";
    
    if (paymentStatus === 'selesai') {
      statusText = 'Pembayaran Berhasil';
      badgeClass = 'bg-green-100 text-green-800';
    } else if (paymentStatus === 'pending') {
      statusText = 'Menunggu Pembayaran';
      badgeClass = 'bg-yellow-100 text-yellow-800';
    } else if (paymentStatus === 'deny') {
      statusText = 'Pembayaran Ditolak';
      badgeClass = 'bg-red-100 text-red-800';
    } else if (paymentStatus === 'cancel') {
      statusText = 'Pembayaran Dibatalkan';
      badgeClass = 'bg-red-100 text-red-800';
    } else if (paymentStatus === 'expire') {
      statusText = 'Kadaluarsa';
      badgeClass = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}>
        {statusText}
      </span>
    );
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Informasi Pembayaran</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Nomor Transaksi</p>
          <p className="font-medium">{transaksi?.nomor_transaksi || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tanggal Transaksi</p>
          <p className="font-medium">
            {transaksi?.tanggal_transaksi ? formatDate(transaksi.tanggal_transaksi) : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Metode Pembayaran</p>
          <p className="font-medium">{transaksi?.metode_pembayaran || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status Pembayaran</p>
          <p className="font-medium">
            {getStatusBadge()}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600">Total Pembayaran</p>
          <p className="font-medium text-lg">
            Rp {transaksi?.total_harga?.toLocaleString("id-ID") || "0"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;