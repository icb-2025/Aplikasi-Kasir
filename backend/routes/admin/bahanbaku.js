import express from "express";
import multer from "multer";
import {
  getAllBahanBaku,
  createBahanBaku,
  updateBahanBaku,
  deleteBahanBaku,
  updateBahanBakuStatus,
} from "../../controllers/admin/bahanbakumanager.js";
import authorize from "../../middleware/authorize.js";
import verifyToken from "../../middleware/verifyToken.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// All routes require authentication and admin role
router.use(verifyToken);
router.use(authorize(["admin"]));

router.get("/", getAllBahanBaku);
router.post("/", upload.single("gambar"), createBahanBaku);
router.put("/:id", upload.single("gambar"), updateBahanBaku);
router.delete("/:id", deleteBahanBaku);
router.put("/:id/status", updateBahanBakuStatus);

export default router;