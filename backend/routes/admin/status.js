// routes/admin/status.js 
import express from "express";
import {
  getAllPesanan,
  updateStatusPesanan,
  approvePesanan,
  cancelPesanan,
} from "../../controllers/admin/statuspesanancontroller.js";

const router = express.Router();

// Ambil semua pesanan terbaru (10 terakhir)
router.get("/all", getAllPesanan);

// Update status pesanan (manual update bebas)
router.put("/:id", updateStatusPesanan);

// Admin ACC pesanan (pending -> selesai)
router.put("/:id/approve", approvePesanan);

// Admin batalkan pesanan
router.put("/:id/cancel", cancelPesanan);

export default router;
