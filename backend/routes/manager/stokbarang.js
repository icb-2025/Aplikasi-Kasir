import express from 'express'
import { getAllBarang } from '../../controllers/manager/barangcontroller.js'

const router = express.Router();

// Endpoint untuk dashboard manager
router.get("/", getAllBarang);

export default router;

