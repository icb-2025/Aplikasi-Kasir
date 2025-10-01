import {Schema, model} from "mongoose";

const settingsSchema = new Schema({
  storeName: { type: String, default: "Aplikasi Kasir" },
  storeLogo: { type: String},
  storeAddress: { type: String, default: "" },
  storePhone: { type: String, default: "" },
  taxRate: { type: Number, default: 0 },
  globalDiscount: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  receiptHeader: { type: String, default: "Aplikasi Kasir" },
  receiptFooter: { type: String, default: "Terima kasih telah berbelanja!" },
  showBarcode: { type: Boolean, default: false },
  showCashierName: { type: Boolean, default: true },

  payment_methods: [
  {
    method: { type: String, required: true },
    isActive: { type: Boolean, default: true }, // Tambahkan properti ini
    logo: { type: String },
    channels: [
      {
        name: { type: String, required: true },
        logo: { type: String },
        isActive: { type: Boolean, default: true } // status aktif/nonaktif
      }
    ]
  }
],


  lowStockAlert: { type: Number, default: 10 },
  currency: { type: String, default: "IDR" },
  dateFormat: { type: String, default: "DD/MM/YYYY" },
  language: { type: String, default: "id" }

}, { timestamps: true });

export default model("Settings", settingsSchema);