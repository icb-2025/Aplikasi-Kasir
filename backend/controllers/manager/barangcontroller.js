import Barang from "../../models/databarang.js";

export const getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.find();
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default getAllBarang

