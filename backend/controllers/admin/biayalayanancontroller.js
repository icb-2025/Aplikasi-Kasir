import BiayaLayanan from "../../models/biayalayanan.js";

// ✅ GET all
export const getAllBiayaLayanan = async (req, res) => {
  try {
    const data = await BiayaLayanan.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET by ID
export const getBiayaLayananById = async (req, res) => {
  try {
    const data = await BiayaLayanan.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE
export const createBiayaLayanan = async (req, res) => {
  try {
    const { nama, persen, deskripsi } = req.body;
    const newData = new BiayaLayanan({ nama, persen, deskripsi });
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ UPDATE
export const updateBiayaLayanan = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await BiayaLayanan.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedData)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(200).json(updatedData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ DELETE
export const deleteBiayaLayanan = async (req, res) => {
  try {
    const deletedData = await BiayaLayanan.findByIdAndDelete(req.params.id);
    if (!deletedData)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
