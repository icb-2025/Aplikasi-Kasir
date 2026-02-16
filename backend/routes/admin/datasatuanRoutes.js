import express from 'express';
import {
  getAllDataSatuan,
  getDataSatuanById,
  createDataSatuan,
  updateDataSatuan,
  deleteDataSatuan,
} from '../../controllers/admin/datasatuancontroller.js';

const router = express.Router();

router.get('/', getAllDataSatuan);
router.get('/:id', getDataSatuanById);
router.post('/', createDataSatuan);
router.put('/:id', updateDataSatuan);
router.delete('/:id', deleteDataSatuan);

export default router;
