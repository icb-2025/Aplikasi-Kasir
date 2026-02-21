import express from "express";
import { createPengeluaran, listPengeluaran } from "../../controllers/admin/pengeluarancontroller.js";

const router = express.Router();

router.post("/", createPengeluaran);
router.get("/", listPengeluaran);

export default router;
