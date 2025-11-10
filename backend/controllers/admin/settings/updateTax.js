import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";
import { calculateHargaFinal, updateAllBarangHargaFinal } from "../settings/utils/calculateHarga.js";

export const updateTax = async (req, res) => {
  try {
    const { taxRate } = req.body;
    if (typeof taxRate !== "number" || taxRate < 0)
      return res.status(400).json({ message: "Pajak harus berupa angka positif" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ taxRate });
    else settings.taxRate = taxRate;

    await settings.save();

    // 🔹 Update semua barang menggunakan fungsi utilitas
    await updateAllBarangHargaFinal(Barang, settings);

    res.json({ message: "Pajak berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};