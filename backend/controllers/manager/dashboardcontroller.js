import Transaksi from "../../models/datatransaksi.js";
import Barang from "../../models/databarang.js";

// Ringkasan Dashboard Manager
export const getDashboard = async (req, res) => {
  try {
    // Ambil semua transaksi yang sudah selesai
    const transaksiSelesai = await Transaksi.find({ status: "selesai" });

    // Ringkasan penjualan (jumlah transaksi selesai)
    const totalTransaksi = transaksiSelesai.length;

    // Omset penjualan
    const totalOmset = transaksiSelesai.reduce((sum, trx) => sum + trx.total_harga, 0);

    // Hitung barang terlaris
    const barangCounter = {};
    transaksiSelesai.forEach(trx => {
      trx.barang_dibeli.forEach(item => {
        if (!barangCounter[item.nama_barang]) {
          barangCounter[item.nama_barang] = 0;
        }
        barangCounter[item.nama_barang] += item.jumlah;
      });
    });

    // Ambil 5 barang teratas
    const barangTerlaris = Object.entries(barangCounter)
      .map(([nama_barang, jumlah]) => ({ nama_barang, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    res.json({
      ringkasan_penjualan: totalTransaksi,
      omset_penjualan: totalOmset,
      barang_terlaris: barangTerlaris
    });
  } catch (error) {
    console.error("Error getDashboard:", error);
    res.status(500).json({ message: error.message });
  }
};
