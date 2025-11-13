import { Schema, model } from "mongoose";

const rincianBiayaSchema = new Schema({
  nama: { type: String, required: true, trim: true }, 
  jumlah: { type: Number, required: true, default: 0 }
});

const biayaOperasionalSchema = new Schema({
  rincian_biaya: [rincianBiayaSchema],
  // --- PERUBAHAN SELESAI ---
  
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

biayaOperasionalSchema.pre("save", function (next) {
  this.total = this.rincian_biaya.reduce((sum, item) => sum + item.jumlah, 0);
  next();
});

const BiayaOperasional = model("BiayaOperasional", biayaOperasionalSchema, "BiayaOperasional");

export default BiayaOperasional;