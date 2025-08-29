import Barang from "../models/databarang.js";

// Ambil semua barang
export const getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.find();
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah barang
export const createBarang = async (req, res) => {
  try {
    const barang = new Barang(req.body);
    await barang.save();
    res.status(201).json({ message: "Barang berhasil ditambahkan!", barang });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update barang
export const updateBarang = async (req, res) => {
  try {
    const barang = await Barang.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json({ message: "Barang berhasil diperbarui!", barang });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hapus barang
export const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByIdAndDelete(req.params.id);
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json({ message: "Barang berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};