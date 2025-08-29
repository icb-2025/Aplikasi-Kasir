import mongoose from "mongoose";

const transaksiSchema = new mongoose.Schema({
  nomor_transaksi: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 16
  },
  tanggal_transaksi: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  barang_dibeli: [
    {
      kode_barang: { type: String },  // opsional
      nama_barang: { type: String, required: true },
      jumlah: { type: Number, required: true },
      harga_satuan: { type: Number, required: true },
      subtotal: { type: Number, required: true }
    }
  ],
  total_harga: { 
    type: Number, 
    required: true 
  },
  metode_pembayaran: { 
    type: String, 
    enum: [
      "cash", 
      "kartu kredit", 
      "kartu debit", 
      "e-wallet", 
      "qris", 
      "transfer bank", 
      "virtual account"
    ], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["selesai", "pending", "dibatalkan"], 
    default: "pending" 
  }
}, { timestamps: true });

const Transaksi = mongoose.model("Transaksi", transaksiSchema, "Data-Transaksi");
export default Transaksi;
