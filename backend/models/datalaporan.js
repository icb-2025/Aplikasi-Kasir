import mongoose from "mongoose";

const laporanSchema = new mongoose.Schema({
  laporan_penjualan: {
    harian: [
      {
        tanggal: { type: Date },
        jumlah_transaksi: { type: Number },
        total_penjualan: { type: Number }
      }
    ],
    mingguan: [
      {
        minggu_ke: { type: Number },
        jumlah_transaksi: { type: Number },
        total_penjualan: { type: Number }
      }
    ],
    bulanan: [
      {
        bulan: { type: String },
        jumlah_transaksi: { type: Number },
        total_penjualan: { type: Number }
      }
    ]
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
        laba: { type: Number }
      }
    ]
  },
  pengeluaran: [
    {
      tanggal: { type: Date },
      deskripsi: { type: String },
      jumlah: { type: Number }
    }
  ],
  stok_barang: {
    masuk: [
      {
        tanggal: { type: Date },
        produk: { type: String },
        jumlah: { type: Number }
      }
    ],
    keluar: [
      {
        tanggal: { type: Date },
        produk: { type: String },
        jumlah: { type: Number }
      }
    ]
  },
  rekap_metode_pembayaran: [
    {
      metode: {
        type: String,
        enum: ["cash", "kartu kredit/debit", "dompet digital", "QRIS", "transfer bank", "virtual account"]
      },
      total: { type: Number }
    }
  ]
}, { timestamps: true });

const Laporan = mongoose.model("Laporan", laporanSchema, "Data-Laporan");

export default Laporan;
