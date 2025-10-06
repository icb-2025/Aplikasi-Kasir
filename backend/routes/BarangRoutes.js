import express from "express";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

import { getAllBarang, createBarang, updateBarang, deleteBarang } from "../controllers/databarangControllers.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", getAllBarang);       // GET semua barang
router.post("/", createBarang);      // POST tambah barang
router.put("/:id", updateBarang);    // PUT update barang
router.delete("/:id", deleteBarang); // DELETE hapus barang

export default router;

