import Kategori from "../../models/kategori.js";

// ✅ Tambah kategori baru
export const tambahKategori = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;

    if (!nama) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const cekKategori = await Kategori.findOne({ nama });
    if (cekKategori) {
      return res.status(400).json({ message: "Kategori sudah ada" });
    }

    const kategoriBaru = new Kategori({ nama, deskripsi });
    await kategoriBaru.save();

    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      data: kategoriBaru,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Ambil semua kategori
export const getSemuaKategori = async (req, res) => {
  try {
    const kategori = await Kategori.find().sort({ createdAt: -1 });
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Hapus kategori
export const hapusKategori = async (req, res) => {
  try {
    const { id } = req.params;
    await Kategori.findByIdAndDelete(id);
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Edit kategori
export const editKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;

    const kategori = await Kategori.findByIdAndUpdate(
      id,
      { nama, deskripsi },
      { new: true }
    );

    res.json({
      message: "Kategori berhasil diperbarui",
      data: kategori,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
