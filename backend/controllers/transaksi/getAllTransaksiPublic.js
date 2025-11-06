import Transaksi from "../../models/datatransaksi.js";

export const getAllTransaksiPublic = async (req, res) => {
  try {
    console.log("User dari JWT:", req.user); 

    const transaksi = await Transaksi.find({});
    console.log("Jumlah transaksi ditemukan:", transaksi.length);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};