import express from "express";
import { getDashboard } from "../../controllers/manager/dashboardcontroller.js";

const router = express.Router();

// Endpoint untuk dashboard manager
router.get("/", getDashboard);

export default router;
