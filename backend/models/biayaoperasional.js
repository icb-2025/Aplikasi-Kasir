import { Schema, model } from "mongoose";

const biayaOperasionalSchema = new Schema({
  listrik: { type: Number, default: 0 },
  air: { type: Number, default: 0 },
  internet: { type: Number, default: 0 },
  sewa_tempat: { type: Number, default: 0 },
  gaji_karyawan: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Middleware otomatis hitung total
biayaOperasionalSchema.pre("save", function (next) {
  this.total =
    this.listrik +
    this.air +
    this.internet +
    this.sewa_tempat +
    this.gaji_karyawan;
  next();
});

const BiayaOperasional = model("BiayaOperasional", biayaOperasionalSchema, "BiayaOperasional");

export default BiayaOperasional;
