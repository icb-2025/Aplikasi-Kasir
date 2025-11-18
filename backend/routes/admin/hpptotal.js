import express from "express";
import { addTransaksiToHpp, getHppHarian, getHppSummary } from "../../controllers/admin/hpptotalcontroller.js";

const router = express.Router();

// otomatis insert per transaksi
router.get("/", getHppHarian)
router.get("/summary", getHppSummary )
router.post("/hpp/tambah-transaksi", addTransaksiToHpp);

export default router;
