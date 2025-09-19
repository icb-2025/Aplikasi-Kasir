import express from "express";
import { 
  addBiayaOperasional, 
  getBiayaOperasional, 
  updateBiayaOperasional, 
  deleteBiayaOperasional 
} from "../../controllers/manager/biayaoperasionalcontroller.js";


const router = express.Router();

// hanya manager & admin yang boleh

router.get("/", getBiayaOperasional);
router.post("/", addBiayaOperasional);
router.put("/:id", updateBiayaOperasional);
router.delete("/:id", deleteBiayaOperasional);

export default router;
