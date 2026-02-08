import express from "express";
import multer from "multer";
import {
  getAllBarang,
  createBarang,
  updateBarang,
  deleteBarang,
  decrementStock,
  updateBarangStatus,
} from "../controllers/databarangControllers.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// Middleware untuk handle FormData pada PUT request
const handleFormData = upload.any();

router.get("/", getAllBarang);
router.post("/", upload.single("gambar"), createBarang);
router.put("/:id", handleFormData, updateBarang);
router.post("/:id/update", handleFormData, updateBarang);
router.put("/:id/status", updateBarangStatus);
router.delete("/:id", deleteBarang);
router.post("/:id/decrement", decrementStock);

export default router;
