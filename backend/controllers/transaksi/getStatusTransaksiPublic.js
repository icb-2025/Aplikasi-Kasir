import Transaksi from "../../models/datatransaksi.js";

export const getStatusTransaksiPublic = async (req, res) => {
  try {
    const { order_id } = req.params;

    const transaksi = await Transaksi.findOne({ order_id });
    if (!transaksi) {
      return res.status(404).json({ message: `Transaksi dengan nomor ${order_id} tidak ditemukan` });
    }

    res.status(200).json({
      order_id: transaksi.order_id,
      status: transaksi.status,
      metode_pembayaran: transaksi.metode_pembayaran,
      tanggal_transaksi: transaksi.tanggal_transaksi,
      total_harga: transaksi.total_harga,
      barang_dibeli: transaksi.barang_dibeli.map(item => ({
        nama_barang: item.nama_barang,
        jumlah: item.jumlah,
        subtotal: item.subtotal
      })),
    });
  } catch (error) {
    console.error("Error getStatusTransaksiPublic:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengecek status transaksi", error: error.message });
  }
};
