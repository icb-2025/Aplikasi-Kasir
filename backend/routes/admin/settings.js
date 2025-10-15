// routes/admin/settings.js
import express from "express";
import upload from "../../middleware/upload.js";
import { 
  getSettings, 
  updateTax, 
  updateGlobalDiscount, 
  updateReceipt, 
  updatePaymentMethods,  
  updateServiceCharge,
  updateStoreInfo,
  updateGeneralSettings,
  addPaymentMethod,
  addChannelToMethod,
  updateChannelName,
  togglePaymentMethod,
  updateChannelLogo,
  deleteChannelFromMethod,
  toggleChannelStatus,
  updateUserProfilePicture,
  updateDefaultProfilePicture
} from "../../controllers/admin/settingscontroller.js";
import apiMiddleware from "../../middleware/api.js";

const router = express.Router();

// GET -> ambil semua pengaturan
router.get("/", getSettings);

// PUT -> update pengaturan tertentu
router.put("/tax", updateTax);// update pajak
router.put("/discount", updateGlobalDiscount);// update diskon global
router.put("/service-charge", updateServiceCharge);// update service charge
router.put("/receipt", updateReceipt);// update struk, 
router.put("/payment-methods", updatePaymentMethods);// update metode pembayaran
router.put("/payment-methods/toggle", togglePaymentMethod);// update metode pembayaran
router.post("/payment-methods/add", addPaymentMethod); // ⬅️ untuk method pembayaran baru
router.post("/payment-methods/add-channel", addChannelToMethod); // ⬅️ untuk channel baru
router.put("/payment-methods/channel-logo", upload.single("logo"), updateChannelLogo); // ⬅️ untuk upload logo channel
router.patch("/payment-methods/channel-toggle", toggleChannelStatus); // ⬅️ untuk toggle status aktif/nonaktif channel
router.delete("/payment-methods/channel", deleteChannelFromMethod); // ⬅️ untuk hapus channel dari method
router.put("/payment-methods/channel-name", updateChannelName); // ⬅️ untuk ganti nama channel
router.put("/store", upload.single("storeLogo"), updateStoreInfo);// update info toko dengan logo
router.put("/general", updateGeneralSettings);// update pengaturan umum
router.put("/users/:userId/profile-picture", apiMiddleware(), upload.single("profilePicture"), updateUserProfilePicture)
router.put("/default", apiMiddleware(), upload.single("profilePicture"), updateDefaultProfilePicture)


export default router;