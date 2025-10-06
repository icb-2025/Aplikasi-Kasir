import express from "express";
import {
  getAllLaporan,
  getLaporanByPeriode,
  getRingkasanPenjualan,
  getRekapMetodePembayaran,
  getLaba,
  getTanggalHarian,
  getTotalPenjualan
} from "../../controllers/manager/laporancontroller.js";

const router = express.Router();

// Semua laporan
router.get("/", getAllLaporan);

// Laporan berdasarkan periode
router.get("/periode", getLaporanByPeriode);

// Ringkasan penjualan (harian/mingguan/bulanan)
router.get("/penjualan/:jenis", getRingkasanPenjualan);

// Rekap metode pembayaran
router.get("/rekap-pembayaran", getRekapMetodePembayaran);

// Laba
router.get("/laba", getLaba);

// Filter Tanggal Harian
router.get("/tanggal-harian", getTanggalHarian)

// Total Penjualan
router.get("/total-penjualan", getTotalPenjualan);

export default router;
