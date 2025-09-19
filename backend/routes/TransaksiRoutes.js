import express from "express";
import { 
  getAllTransaksi,
  createTransaksi, 
  deleteTransaksiById,
  deleteTransaksiByNomor,
  updateStatusTransaksi,
  midtransCallback,
  getStatusTransaksi
} from "../controllers/datatransaksiController.js";

const router = express.Router();

router.get("/", getAllTransaksi)
router.post("/", createTransaksi);                   // POST tambah transaksi
router.delete("/:id", deleteTransaksiById);       // DELETE pakai _id
router.delete("/nomor/:nomor_transaksi", deleteTransaksiByNomor); // DELETE pakai nomor_transaksi
router.get("/:order_id", getStatusTransaksi); // cek status transaksi
router.put("/:id", updateStatusTransaksi); // update status manual

router.post("/midtrans-callback", midtransCallback, (req, res) => {
  console.log("Callback masuk jam:", new Date().toISOString())
  console.log("Body:", JSON.stringify(req.body, null, 2))
  res.json({received: true})
});

export default router;


