import Transaksi from "../../models/datatransaksi.js";

export const deleteTransaksiByNomor = async (req, res) => {
  try {
    const transaksi = await Transaksi.findOneAndDelete({ nomor_transaksi: req.params.nomor_transaksi });
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Transaksi berhasil dihapus (pakai nomor_transaksi)!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};