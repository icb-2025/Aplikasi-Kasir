import BiayaOperasional from "../../models/biayaoperasional.js";

// Tambah biaya operasional

export const addBiaya = async (req, res) => {
  try {
   
    const { listrik, air, internet, sewa_tempat, gaji_karyawan } = req.body;

    const biaya = new BiayaOperasional({
      listrik: Number(listrik) || 0,
      air: Number(air) || 0,
      internet: Number(internet) || 0,
      sewa_tempat: Number(sewa_tempat) || 0,
      gaji_karyawan: Number(gaji_karyawan) || 0
    });

    // total otomatis dari pre-save middleware
    await biaya.save();

    res.json({ message: "Biaya operasional berhasil ditambahkan!", data: biaya });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan biaya", error: err.message });
  }
};


// Ambil semua data biaya
export const getBiaya = async (req, res) => {
  try {
    const data = await BiayaOperasional.find(); 
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};

// Update biaya
export const updateBiaya = async (req, res) => {
  try {
    const biaya = await BiayaOperasional.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!biaya) return res.status(404).json({ message: "Data tidak ditemukan" });

    // hitung ulang total
    biaya.total =
      biaya.listrik +
      biaya.air +
      biaya.internet +
      biaya.sewa_tempat +
      biaya.gaji_karyawan;

    await biaya.save();
    res.json({ message: "Biaya berhasil diperbarui", data: biaya });
  } catch (err) {
    res.status(500).json({ message: "Gagal update", error: err.message });
  }
};

// Hapus biaya
export const deleteBiaya = async (req, res) => {
  try {
    const biaya = await BiayaOperasional.findByIdAndDelete(req.params.id);
    if (!biaya) return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json({ message: "Biaya berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus", error: err.message });
  }
};
