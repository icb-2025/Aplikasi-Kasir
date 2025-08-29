import express from "express";
import { 
  getAllTransaksi,
  createTransaksi, 
  deleteTransaksiById,
  deleteTransaksiByNomor
} from "../controllers/datatransaksiController.js";

const router = express.Router();

router.get("/", getAllTransaksi)
router.post("/", createTransaksi);                   // POST tambah transaksi
router.delete("/:id", deleteTransaksiById);       // DELETE pakai _id
router.delete("/nomor/:nomor_transaksi", deleteTransaksiByNomor); // DELETE pakai nomor_transaksi

export default router;
