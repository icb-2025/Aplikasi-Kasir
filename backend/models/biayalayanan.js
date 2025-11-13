import mongoose from "mongoose";

const biayaLayananSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    persen: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    deskripsi: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const BiayaLayanan = mongoose.model("BiayaLayanan", biayaLayananSchema, "BiayaLayanan");
export default BiayaLayanan;