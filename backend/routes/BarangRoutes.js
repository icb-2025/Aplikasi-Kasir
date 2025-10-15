import express from "express";
import multer from "multer";
import {
  getAllBarang,
  createBarang,
  updateBarang,
  deleteBarang,
  decrementStock,
} from "../controllers/databarangControllers.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", getAllBarang);
router.post("/", upload.single("gambar"), createBarang);
router.put("/:id", upload.single("gambar"), updateBarang);
router.delete("/:id", deleteBarang);
router.post("/:id/decrement", decrementStock);

export default router;
