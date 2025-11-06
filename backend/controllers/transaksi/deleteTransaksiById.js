import Transaksi from "../../models/datatransaksi.js";

export const deleteTransaksiById = async (req, res) => {
  try {
    const transaksi = await Transaksi.findByIdAndDelete(req.params.id);
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Transaksi berhasil dihapus (pakai _id)!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};