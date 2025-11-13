import express from "express";
import { addOrUpdateBiaya, getBiaya, deleteRincianBiayaById } from "../../controllers/admin/biayaoperasionalcontroller.js";

const router = express.Router();

// hanya manager & admin yang boleh
router.get("/", getBiaya);
router.post("/", addOrUpdateBiaya); // POST tapi fungsinya update jika sudah ada
router.delete("/:id", deleteRincianBiayaById)

export default router;


