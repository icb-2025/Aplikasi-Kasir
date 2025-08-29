import mongoose from "mongoose";

const barangSchema = new mongoose.Schema({
  kode_barang: { type: String, required: true, unique: true, maxlength: 12 },
  nama_barang: { type: String, required: true },
  kategori: { type: String, required: true },
  harga_beli: { type: Number, required: true },
  harga_jual: { type: Number, required: true },
  stok: { type: Number, required: true }
}, { timestamps: true });

// Koleksi bernama "Data-Barang"
const Barang = mongoose.model("Barang", barangSchema, "Data-Barang");

export default Barang;
