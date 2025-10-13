import {Schema, model} from "mongoose";

const laporanSchema = new Schema({
  laporan_penjualan: {
    // Harian: beberapa controller menggunakan tanggal sebagai Date + jumlah/total,
    // beberapa lain menyimpan tanggal sebagai string 'YYYY-MM-DD' dan menyertakan array `transaksi`.
    harian: [
      new Schema(
        {
          tanggal: { type: Schema.Types.Mixed }, // Date or String (YYYY-MM-DD)
          // legacy/simple counters
          jumlah_transaksi: { type: Number, default: 0 },
          total_penjualan: { type: Number, default: 0 },
          // richer structure used in addTransaksiToLaporan
          transaksi: [
            {
              nomor_transaksi: String,
              total_harga: Number,
              barang_dibeli: Array,
              tanggal_transaksi: Date,
            }
          ],
          total_harian: { type: Number, default: 0 }
        },
        { _id: false }
      )
    ],

    mingguan: [
      new Schema(
        {
          minggu_ke: { type: Number },
          jumlah_transaksi: { type: Number, default: 0 },
          total_penjualan: { type: Number, default: 0 }
        },
        { _id: false }
      )
    ],

    bulanan: [
      new Schema(
        {
          bulan: { type: String },
          jumlah_transaksi: { type: Number, default: 0 },
          total_penjualan: { type: Number, default: 0 }
        },
        { _id: false }
      )
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
        kode_barang: { type: String },
        produk: { type: String },
        harga_jual: { type: Number, default: 0 },
        harga_beli: { type: Number, default: 0 },
        jumlah: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        laba: { type: Number, default: 0 } // harga_jual - harga_beli
      }
    ]
  },

  biaya_operasional_id: {
    type: Schema.Types.ObjectId,
    ref: "BiayaOperasional"
  },

  // pengeluaran bisa berupa angka total atau struktur lebih kompleks di masa mendatang
  pengeluaran: { type: Schema.Types.Mixed, default: 0 },

  rekap_metode_pembayaran: [
    {
      metode: { type: String, required: true },
      total: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

const Laporan = model("Laporan", laporanSchema, "Data-Laporan");
export default Laporan;
