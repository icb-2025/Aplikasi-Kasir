import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";

export const updateTax = async (req, res) => {
  try {
    const { taxRate } = req.body;
    if (typeof taxRate !== "number" || taxRate < 0)
      return res.status(400).json({ message: "Pajak harus berupa angka positif" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ taxRate });
    else settings.taxRate = taxRate;

    await settings.save();

    // 🔹 Update semua barang
    const barang = await Barang.find();
    for (let b of barang) {
      const discountRate = settings.globalDiscount || 0;
      const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * discountRate) / 100;
      b.hargaFinal = Number(
        (hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100).toFixed(2)
      );
      await b.save();
    }

    res.json({ message: "Pajak berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};