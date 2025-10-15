import BiayaOperasional from "../../models/biayaoperasional.js";

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
      res.json({ message: "Biaya operasional pertama berhasil dibuat!", data: newBiaya });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan biaya operasional", error: err.message });
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
