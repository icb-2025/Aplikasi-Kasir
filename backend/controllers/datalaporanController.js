import Laporan from "../models/datalaporan.js";

// Ambil semua Laporan
export const getAllLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.find();
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah Laporan
export const createLaporan = async (req, res) => {
  try {
    const laporan = new Laporan(req.body);
    await laporan.save();
    res.status(201).json({ message: "Laporan berhasil ditambahkan!", laporan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Laporan
export const updateLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!laporan) return res.status(404).json({ message: "Laporan tidak ditemukan" });
    res.json({ message: "Laporan berhasil diperbarui!", laporan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hapus Laporan
export const deleteLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.findByIdAndDelete(req.params.id);
    if (!laporan) return res.status(404).json({ message: "Laporan tidak ditemukan" });
    res.json({ message: "Laporan berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

