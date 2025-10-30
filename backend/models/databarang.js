import { Schema, model } from "mongoose";

const barangSchema = new Schema(
  {
    kode_barang: { type: String, required: true, unique: true, maxlength: 12 },
    nama_barang: { type: String, required: true },
    kategori: { type: String, required: true, trim: true }, 
    harga_beli: { type: Number, required: true },
    harga_jual: { type: Number, required: true },
    stok: { type: Number, required: true },
    stok_minimal: { type: Number, default: 0 },
    hargaFinal: { type: Number, default: 0 },
    use_discount: { type: Boolean, default: true },
    gambar_url: { type: String, default: "" },
  },
  { timestamps: true }
);

const Barang = model("Barang", barangSchema, "Data-Barang");
export default Barang;
