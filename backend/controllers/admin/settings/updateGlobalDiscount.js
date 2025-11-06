import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";

export const updateGlobalDiscount = async (req, res) => {
  try {
    const { globalDiscount } = req.body;
    if (typeof globalDiscount !== "number" || globalDiscount < 0)
      return res.status(400).json({ message: "Diskon harus berupa angka positif" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ globalDiscount });
    else settings.globalDiscount = globalDiscount;

    await settings.save();

    // 🔹 Update semua barang
    const barang = await Barang.find();
    for (let b of barang) {
      const taxRate = settings.taxRate || 0;
      const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * globalDiscount) / 100;
      b.hargaFinal = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
      await b.save();
    }

    res.json({ message: "Diskon global berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};