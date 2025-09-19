// routes/admin/stok.js
import express from "express";
import multer from "multer";
import {
    getAllBarang,
    createBarang,
    updateBarang,
    deleteBarang,
} from "../../controllers/admin/stokbarangcontroller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temporary folder

router.get("/", getAllBarang);
router.post("/", upload.single("gambar"), createBarang);
router.put("/:id", upload.single("gambar"), updateBarang);
router.delete("/:id", deleteBarang);

export default router;
