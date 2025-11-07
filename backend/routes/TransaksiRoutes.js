import express from "express";
import { 
  getAllTransaksi,
  createTransaksi, 
  deleteTransaksiById,
  deleteTransaksiByNomor,
  updateStatusTransaksi,
  midtransCallback,
  getStatusTransaksi,
  cancelTransaksi,
  getStatusTransaksiPublic,
  getAllTransaksiPublic,
} from "../controllers/datatransaksiController.js";
// import apiMiddleware from "../middleware/api.js";

const router = express.Router();

// ===================== 🔒 Protected (harus login: kasir/admin) =====================
router.get("/", getAllTransaksi); // lihat transaksi (admin: semua, kasir: hanya miliknya)
router.get("/status/:order_id",  getStatusTransaksi); // cek status transaksi (kasir/admin)
router.post("/", createTransaksi);                   // tambah transaksi
router.delete("/:id", deleteTransaksiById);          // hapus pakai _id
router.delete("/nomor/:nomor_transaksi", deleteTransaksiByNomor); // hapus pakai nomor_transaksi
router.put("/:id", updateStatusTransaksi);           // update status manual
router.put("/cancel/:id", cancelTransaksi);          // batalkan transaksi

// ===================== 🌍 Public (pembeli, tidak perlu login) =====================
router.get("/public/all", getAllTransaksiPublic);        // semua transaksi (hanya field terbatas)
router.get("/public/status/:order_id", getStatusTransaksiPublic); // cek status transaksi pembeli

// ===================== 🔔 Midtrans Callback =====================
router.post("/midtrans-callback", midtransCallback, (req, res) => {
  console.log("Callback masuk jam:", new Date().toISOString());
  console.log("Body:", JSON.stringify(req.body, null, 2));
  res.json({ received: true });
});

export default router;
