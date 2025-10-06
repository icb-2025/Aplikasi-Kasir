// routes/admin/laporan.js
import express from "express";
import {
    getAllLaporan,
    getLaporanByPeriode,
    getRingkasanPenjualan,
    getRekapMetodePembayaran,
    getLaba
} from "../../controllers/admin/laporancontroller.js";

const router = express.Router();

// Ambil semua pesanan terbaru (10 terakhir)
router.get("/", getAllLaporan);

// Update status pesanan (manual update bebas)
router.get("/periode", getLaporanByPeriode);

// Admin ACC pesanan (pending -> selesai)
router.get("/ringkasan", getRingkasanPenjualan);

// Admin batalkan pesanan
router.get("/metode-pembayaran", getRekapMetodePembayaran);
router.get("/laba", getLaba)

export default router;
