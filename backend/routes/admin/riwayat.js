// routes/admin/riwayat.js
import express from "express";
import {
  getAllTransaksi,
  updateTransaksi,
  deleteTransaksi,
} from "../../controllers/admin/riwayatcontroller.js";

const router = express.Router();

// 🔹 Lihat semua transaksi
router.get("/", getAllTransaksi);

// 🔹 Update transaksi
router.put("/:id", updateTransaksi);

// 🔹 Hapus transaksi
router.delete("/:id", deleteTransaksi);

export default router;
