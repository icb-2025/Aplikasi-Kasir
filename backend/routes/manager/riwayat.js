import express from "express";
import {getAllTransaksi} from "../../controllers/manager/riwayatcontroller.js";

const router = express.Router();

// Endpoint untuk dashboard manager
router.get("/", getAllTransaksi);

export default router;
