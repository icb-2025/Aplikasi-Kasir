import { Schema, model } from "mongoose";

const pengeluaranBiayaSchema = new Schema(
  {
    kategoriId: { type: Schema.Types.ObjectId, ref: "BiayaOperasional", required: true },
    jumlah: { type: Number, required: true },
    tanggal: { type: Date, required: true },
    keterangan: { type: String, default: null },
  },
  { timestamps: true }
);

const PengeluaranBiaya = model("PengeluaranBiaya", pengeluaranBiayaSchema, "pengeluaran_biaya");

export default PengeluaranBiaya;
