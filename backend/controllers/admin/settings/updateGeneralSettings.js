import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";

export const updateGeneralSettings = async (req, res) => {
  try {
    const { lowStockAlert, currency, dateFormat, language } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        lowStockAlert,
        currency,
        dateFormat,
        language,
      });
    } else {
      if (lowStockAlert !== undefined) settings.lowStockAlert = lowStockAlert;
      if (currency !== undefined) settings.currency = currency;
      if (dateFormat !== undefined) settings.dateFormat = dateFormat;
      if (language !== undefined) settings.language = language;
      await settings.save();
    }

    if (lowStockAlert !== undefined) {
      try {
        console.log(`Memperbarui stok_minimal untuk semua barang menjadi: ${lowStockAlert}`);
        
        const result = await Barang.updateMany(
          {}, 
          { $set: { stok_minimal: lowStockAlert } } 
        );
        
        console.log(`Berhasil memperbarui stok_minimal untuk ${result.modifiedCount} barang.`);
      } catch (barangUpdateError) {
        console.error("Gagal memperbarui stok_minimal untuk semua barang:", barangUpdateError);
      }
    }

    res.json({ message: "Pengaturan umum berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};