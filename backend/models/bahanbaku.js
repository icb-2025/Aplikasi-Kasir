import { Schema, model } from "mongoose";

const bahanBakuSchema = new Schema(
  {
    nama: { 
      type: String, 
      required: true 
    },
    bahan: [
      {
        nama: { type: String, required: true },
        harga: { type: Number, required: true },
        jumlah: { type: Number, required: true }
      }
    ],
    total_stok: { 
      type: Number, 
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

export default model("BahanBaku", bahanBakuSchema, "Bahan-Baku");