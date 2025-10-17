import mongoose from "mongoose";

const kategoriSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    deskripsi: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const Kategori = mongoose.model("Kategori", kategoriSchema, "Kategori");

export default Kategori;
