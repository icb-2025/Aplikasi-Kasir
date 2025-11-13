import express from "express";
import {
  getAllBiayaLayanan,
  getBiayaLayananById,
  createBiayaLayanan,
  updateBiayaLayanan,
  deleteBiayaLayanan,
} from "../../controllers/admin/biayalayanancontroller.js";

const router = express.Router();

router.get("/", getAllBiayaLayanan);
router.get("/:id", getBiayaLayananById);
router.post("/", createBiayaLayanan);
router.put("/:id", updateBiayaLayanan);
router.delete("/:id", deleteBiayaLayanan);

export default router;
