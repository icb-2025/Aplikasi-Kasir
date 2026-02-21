import PengeluaranBiaya from "../../models/pengeluaranbiaya.js";
import BiayaOperasional from "../../models/biayaoperasional.js";

// POST /api/admin/pengeluaran-biaya
export const createPengeluaran = async (req, res) => {
  try {
    const { kategoriId, jumlah, tanggal, keterangan } = req.body;

    if (!kategoriId) return res.status(400).json({ message: "kategoriId wajib diisi" });
    if (!jumlah || Number(jumlah) <= 0) return res.status(400).json({ message: "jumlah harus > 0" });
    if (!tanggal) return res.status(400).json({ message: "tanggal wajib diisi" });

    // verify kategori exists
    const kategori = await BiayaOperasional.findById(kategoriId);
    if (!kategori) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const doc = new PengeluaranBiaya({
      kategoriId,
      jumlah: Number(jumlah),
      tanggal: new Date(tanggal),
      keterangan: keterangan || null,
    });

    await doc.save();
    res.json({ message: "Pengeluaran berhasil dibuat", data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat pengeluaran", error: err.message });
  }
};

// GET /api/admin/pengeluaran-biaya?start=YYYY-MM-DD&end=YYYY-MM-DD
export const listPengeluaran = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start || end) {
      match.tanggal = {};
      if (start) match.tanggal.$gte = new Date(start);
      if (end) {
        const d = new Date(end);
        d.setHours(23, 59, 59, 999);
        match.tanggal.$lte = d;
      }
    }

    const data = await PengeluaranBiaya.find(match).sort({ tanggal: -1 }).populate("kategoriId");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data pengeluaran", error: err.message });
  }
};
