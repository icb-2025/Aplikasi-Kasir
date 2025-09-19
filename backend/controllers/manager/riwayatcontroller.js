import Transaksi from "../../models/datatransaksi.js";

export const getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.find()
      .populate("kasir_id", "nama_lengkap username") // 🔹 ambil field dari User
      .sort({ createdAt: -1 }); // biar urut terbaru dulu

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};

export default getAllTransaksi;
