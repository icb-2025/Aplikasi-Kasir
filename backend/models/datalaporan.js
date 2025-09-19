import {Schema, model} from "mongoose";

const laporanSchema = new Schema({
  laporan_penjualan: {
    harian: [{ tanggal: Date, jumlah_transaksi: Number, total_penjualan: Number }],
    mingguan: [{ minggu_ke: Number, jumlah_transaksi: Number, total_penjualan: Number }],
    bulanan: [{ bulan: String, jumlah_transaksi: Number, total_penjualan: Number }]
  },
  periode: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  laba: {
    total_laba: { type: Number, default: 0 },
    detail: [
      {
        produk: { type: String },
        harga_jual: { type: Number },
        harga_beli: { type: Number },
        laba: { type: Number } // harga_jual - harga_beli
      }
    ]
  },
  biaya_operasional_id: { // 🔹 tambahkan ini
    type: Schema.Types.ObjectId,
    ref: "BiayaOperasional"
  },
  pengeluaran: [
    {
      tanggal: { type: Date },
      deskripsi: { type: String },
      jumlah: { type: Number }
    }
  ],
  rekap_metode_pembayaran: [
    {
      metode: { type: String, required: true },
      total: { type: Number }
    }
  ]
}, { timestamps: true });

const Laporan = model("Laporan", laporanSchema, "Data-Laporan");
export default Laporan;
