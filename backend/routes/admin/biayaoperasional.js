import express from "express";
import { addOrUpdateBiaya, getBiaya } from "../../controllers/admin/biayaoperasionalcontroller.js";

const router = express.Router();

// hanya manager & admin yang boleh
router.get("/", getBiaya);
router.post("/", addOrUpdateBiaya); // POST tapi fungsinya update jika sudah ada

export default router;
