// routes/admin/dashboard.js
import express from "express";
import { getDashboardOmzet, getTransaksi, getTopBarang, getLaporanPenjualan, getBreakdownMetodePembayaran, getLatestTransaksi} from "../../controllers/admin/dashboardcontroller.js";

const router = express.Router();

router.get("/omzet", getDashboardOmzet);
router.get("/status-pesanan", getTransaksi);
router.get("/top-barang", getTopBarang);
router.get("/laporan-penjualan/:jenis", getLaporanPenjualan);
router.get("/breakdown-pembayaran", getBreakdownMetodePembayaran)
router.get("/transaksi/terakhir", getLatestTransaksi)

export default router;