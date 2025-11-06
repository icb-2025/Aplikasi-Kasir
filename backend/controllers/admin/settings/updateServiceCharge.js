import Settings from "../../../models/settings.js";
import Barang from "../../../models/databarang.js";
import BiayaOperasional from "../../../models/biayaoperasional.js";

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
      // Asumsi total_nilai_barang adalah potensi penjualan per hari
      const estimasiPenjualanBulanan = totalNilaiBarang * 30; // estimasi 30 hari
      
      // Biaya operasional dibagi estimasi penjualan bulanan
      calculatedServiceCharge = (totalBiayaOperasional / estimasiPenjualanBulanan) * 100;
      
      // Batasi maksimum service charge (25%)
      const MAX_SERVICE_CHARGE = 100;
      calculatedServiceCharge = Math.min(
        Math.round(calculatedServiceCharge * 100) / 100, // 2 desimal
        MAX_SERVICE_CHARGE
      );
    }

    // 🔹 Update settings: simpan calculatedServiceCharge dan gunakan langsung sebagai serviceCharge
    // karena diinginkan agar serviceCharge selalu diambil dari biaya operasional bagian total.
    settings.calculatedServiceCharge = calculatedServiceCharge;
    settings.serviceCharge = calculatedServiceCharge;
    await settings.save();

  // 🔹 Update semua barang dengan serviceCharge baru (gunakan nilai serviceCharge dari settings)
  const barangList = await Barang.find();
  const serviceCharge = settings.serviceCharge || 0;
    const taxRate = settings.taxRate || 0;
    const globalDiscount = settings.globalDiscount || 0;

    for (let b of barangList) {
      const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * globalDiscount) / 100;
      const hargaSetelahPajak = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
      const hargaFinal = hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;

      b.hargaFinal = Math.round(hargaFinal);
      await b.save();
    }

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