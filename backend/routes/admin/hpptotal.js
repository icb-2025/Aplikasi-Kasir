import express from "express";
import { addTransaksiToHpp, getHppHarian } from "../../controllers/admin/hpptotalcontroller.js";

const router = express.Router();

// otomatis insert per transaksi
router.get("/", getHppHarian)
router.post("/hpp/tambah-transaksi", addTransaksiToHpp);

export default router;
