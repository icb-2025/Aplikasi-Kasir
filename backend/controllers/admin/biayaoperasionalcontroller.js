import BiayaOperasional from "../../models/biayaoperasional.js";
import Barang from "../../models/databarang.js";
import Settings from "../../models/settings.js";

// Tambah atau edit biaya operasional (hanya satu dokumen)
export const addOrUpdateBiaya = async (req, res) => {
  try {
    const { listrik, air, internet, sewa_tempat, gaji_karyawan } = req.body;

    // cek apakah sudah ada data
    let biaya = await BiayaOperasional.findOne();

    if (biaya) {
      // kalau sudah ada, update saja
      biaya.listrik = Number(listrik) || 0;
      biaya.air = Number(air) || 0;
      biaya.internet = Number(internet) || 0;
      biaya.sewa_tempat = Number(sewa_tempat) || 0;
      biaya.gaji_karyawan = Number(gaji_karyawan) || 0;

      // total dihitung otomatis oleh middleware
      await biaya.save();
      // Setelah update biaya operasional, update hargaFinal semua barang
      await updateAllBarangHargaFinal();
      res.json({ message: "Biaya operasional berhasil diperbarui!", data: biaya });
    } else {
      // kalau belum ada sama sekali, buat satu kali saja
      const newBiaya = new BiayaOperasional({
        listrik: Number(listrik) || 0,
        air: Number(air) || 0,
        internet: Number(internet) || 0,
        sewa_tempat: Number(sewa_tempat) || 0,
        gaji_karyawan: Number(gaji_karyawan) || 0,
      });
      await newBiaya.save();
      // Setelah buat biaya operasional, update hargaFinal semua barang
      await updateAllBarangHargaFinal();
      res.json({ message: "Biaya operasional pertama berhasil dibuat!", data: newBiaya });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan biaya operasional", error: err.message });
  }
}

// Fungsi untuk update hargaFinal semua barang

export const updateAllBarangHargaFinal = async () => {
  const settings = await Settings.findOne();
  const taxRate = settings?.taxRate ?? 0;
  const globalDiscount = settings?.globalDiscount ?? 0;
  const serviceCharge = settings?.serviceCharge ?? 0;
  // Tidak menambahkan totalBiayaOperasional, samakan dengan createBarang
  const allBarang = await Barang.find();
  for (const barang of allBarang) {
    const hargaJual = Number(barang.harga_jual) || 0;
    const hargaSetelahDiskon = hargaJual - (hargaJual * globalDiscount) / 100;
    const hargaSetelahPajak = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
    const hargaFinal = hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;
    barang.hargaFinal = Math.round(hargaFinal);
    await barang.save();
  }
};


// Ambil data biaya (selalu 1 dokumen)
export const getBiaya = async (req, res) => {
  try {
    const data = await BiayaOperasional.findOne(); 
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};
