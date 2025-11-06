import Transaksi from "../../models/datatransaksi.js";

export const getUserHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    const transaksi = await Transaksi.find({ user_id: req.user.id })
      .sort({ createdAt: -1 }); 

    if (!transaksi || transaksi.length === 0) {
      return res.status(404).json({ message: "Belum ada riwayat transaksi" });
    }

    res.json({
      message: "Riwayat transaksi berhasil diambil",
      riwayat: transaksi.map(trx => ({
        order_id: trx.order_id,
        nama_barang: trx.barang_dibeli, 
        status: trx.status,
        metode_pembayaran: trx.metode_pembayaran,
        total_harga: trx.total_harga,
        kasir_id: trx.kasir_id,
        createdAt: trx.createdAt,
      }))
    });
  } catch (err) {
    console.error("Error getUserHistory:", err);
    res.status(500).json({ message: err.message });
  }
};