import express from "express";
import { 
  addBiaya, 
  getBiaya, 
  updateBiaya, 
  deleteBiaya 
} from "../../controllers/admin/biayaoperasionalcontroller.js";

const router = express.Router();

// hanya manager & admin yang boleh

router.get("/", getBiaya);
router.post("/", addBiaya);
router.put("/:id", updateBiaya);
router.delete("/:id", deleteBiaya);

export default router;
