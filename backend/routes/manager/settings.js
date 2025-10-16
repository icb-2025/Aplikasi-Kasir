import express from "express";
import {
  getSettings,
  updateTax,
  updateGlobalDiscount,
  updateReceipt,
  updatePaymentMethods,
  updateChannelLogo,
  getStatusPayments
} from "../../controllers/manager/settingscontroller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET -> ambil semua pengaturan
router.get("/", getSettings);
router.get("/status", getStatusPayments)

// PUT -> update pajak, diskon, struk, pembayaran
router.put("/tax", updateTax);
router.put("/discount", updateGlobalDiscount);
router.put("/receipt", updateReceipt);
router.put("/payments-methods", upload.single("logo"), updatePaymentMethods);
router.put("/channel-logo", upload.single("logo"), updateChannelLogo);

// POST -> tambah method & channel

export default router;
