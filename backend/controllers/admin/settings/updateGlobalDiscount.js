import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";
import { calculateHargaFinal, updateAllBarangHargaFinal } from "../settings/utils/calculateHarga.js";

export const updateGlobalDiscount = async (req, res) => {
  try {
    const { globalDiscount } = req.body;
    if (typeof globalDiscount !== "number" || globalDiscount < 0)
      return res.status(400).json({ message: "Diskon harus berupa angka positif" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ globalDiscount });
    else settings.globalDiscount = globalDiscount;

    await settings.save();

    // 🔹 Update semua barang menggunakan fungsi utilitas
    await updateAllBarangHargaFinal(Barang, settings);

    res.json({ message: "Diskon global berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};