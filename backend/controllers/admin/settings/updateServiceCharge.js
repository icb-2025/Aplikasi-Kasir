import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";
import BiayaOperasional from "../../../models/biayaoperasional.js";
import { calculateHargaFinal, updateAllBarangHargaFinal } from "../settings/utils/calculateHarga.js";

export const updateServiceCharge = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // 🔹 Ambil nilai dari biaya operasional
    const biayaOp = await BiayaOperasional.findOne();
    if (!biayaOp) {
      return res.json({
        message: "Tidak ada data biaya operasional",
        settings
      });
    }

    const totalBiayaOperasional = biayaOp.total || 0;

    // 🔹 Hitung total nilai barang
    const allBarang = await Barang.find();
    const totalNilaiBarang = allBarang.reduce((sum, b) => sum + (Number(b.harga_jual) || 0), 0);

    // 🔹 Hitung service charge dari biaya operasional
    let calculatedServiceCharge = 0;
    if (totalNilaiBarang > 0) {
      const estimasiPenjualanBulanan = totalNilaiBarang * 30;
      calculatedServiceCharge = (totalBiayaOperasional / estimasiPenjualanBulanan) * 100;
      
      const MAX_SERVICE_CHARGE = 100;
      calculatedServiceCharge = Math.min(
        Math.round(calculatedServiceCharge * 100) / 100,
        MAX_SERVICE_CHARGE
      );
    }

    // 🔹 Update settings
    settings.calculatedServiceCharge = calculatedServiceCharge;
    settings.serviceCharge = calculatedServiceCharge;
    await settings.save();

    // 🔹 Update semua barang menggunakan fungsi utilitas
    await updateAllBarangHargaFinal(Barang, settings);

    res.json({
      message: "Service charge berhasil diperbarui!",
      settings,
      detail: {
        totalBiayaOperasional,
        totalNilaiBarangPerHari: totalNilaiBarang,
        estimasiPenjualanBulanan: totalNilaiBarang * 30,
        serviceCharge: `${calculatedServiceCharge}% (max 25%)`
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};