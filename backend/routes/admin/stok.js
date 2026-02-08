import express from "express";
import multer from "multer";
import {
    getAllBarang,
    createBarang,
    updateBarang,
    deleteBarang,
    createProduction,
    getAllProductions,
    publishBarang
} from "../../controllers/admin/stokbarangcontroller.js";
import { updateBarangStatus } from "../../controllers/databarangControllers.js";
import authorize from "../../middleware/authorize.js";
import verifyToken from "../../middleware/verifyToken.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temporary folder

// Apply auth per route instead of globally
// router.use(verifyToken);
// router.use(authorize(["admin"]));

router.get("/", getAllBarang);
router.post("/", upload.single("gambar"), createBarang);
router.put("/:id/status", verifyToken, authorize(["admin"]), updateBarangStatus);
router.put("/:id", upload.single("gambar"), updateBarang);
router.delete("/:id", deleteBarang);

// Production routes
router.post("/production", verifyToken, authorize(["admin"]), createProduction);
router.get("/productions", verifyToken, authorize(["admin"]), getAllProductions);
router.get("/productions-test", getAllProductions); // Test endpoint without auth

// Publish barang route
router.post("/publish-barang", verifyToken, authorize(["admin"]), publishBarang);

// Update status route
router.put("/:id/status", verifyToken, authorize(["admin"]), updateBarangStatus);

export default router;
