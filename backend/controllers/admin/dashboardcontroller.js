import Transaksi from "../../models/datatransaksi.js";
import Laporan from "../../models/datalaporan.js";

export const getDashboardOmzet = async (req, res) => {
  try {
    const now = new Date();

    // Range hari ini
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Range minggu ini (Senin - Minggu)
    const day = now.getDay(); // Minggu = 0, Senin = 1, dst.
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const trx = await Transaksi.find({ status: "selesai" });

    const omzetHarian = trx
      .filter(t => t.tanggal_transaksi >= startOfDay && t.tanggal_transaksi <= endOfDay)
      .reduce((sum, t) => sum + t.total_harga, 0);
    const omzetMingguan = trx
      .filter(t => t.tanggal_transaksi >= startOfWeek && t.tanggal_transaksi <= endOfWeek)
      .reduce((sum, t) => sum + t.total_harga, 0);
    const omzetBulanan = trx
      .filter(t => t.tanggal_transaksi >= startOfMonth && t.tanggal_transaksi <= endOfMonth)
      .reduce((sum, t) => sum + t.total_harga, 0);
    res.json({
      omzet: {
        hari_ini: omzetHarian,
        minggu_ini: omzetMingguan,
        bulan_ini: omzetBulanan
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransaksi = async (req, res) => {
  try {
    // Semua orang bisa lihat semua transaksi
    const transaksi = await Transaksi.find();
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopBarang = async (req, res) => {
  try {
    const transaksiSelesai = await Transaksi.find({ status: "selesai" });

    const barangCounter = {};
    transaksiSelesai.forEach(trx => {
      trx.barang_dibeli.forEach(item => {
        if (!barangCounter[item.nama_barang]) {
          barangCounter[item.nama_barang] = 0;
        }
        barangCounter[item.nama_barang] += item.jumlah;
      });
    });

    const barangTerlaris = Object.entries(barangCounter)
      .map(([nama_barang, jumlah]) => ({ nama_barang, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    res.json({ barang_terlaris: barangTerlaris });
  } catch (error) {
    console.error("Error getTopBarang:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getLaporanPenjualan = async (req, res) => {
  try {
    const { jenis } = req.params; // "harian" | "mingguan" | "bulanan"

    if (!["harian", "mingguan", "bulanan"].includes(jenis)) {
      return res.status(400).json({ message: `Jenis laporan '${jenis}' tidak valid` });
    }

    // Ambil laporan terbaru
    const laporan = await Laporan.find().sort({ createdAt: -1 }).limit(1);

    if (!laporan || laporan.length === 0) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }

    const data = laporan[0].laporan_penjualan[jenis];
    res.json({ jenis, data });
  } catch (error) {
    console.error("Error getLaporanPenjualan:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getBreakdownMetodePembayaran = async (req, res) => {
  try {
    // Ambil hanya transaksi selesai
    const transaksiSelesai = await Transaksi.find({ status: "selesai" });

    const breakdown = {};

    transaksiSelesai.forEach(trx => {
      const metode = trx.metode_pembayaran || "lainnya";
      if (!breakdown[metode]) {
        breakdown[metode] = 0;
      }
      breakdown[metode] += trx.total_harga;
    });

    res.json({ payment_breakdown: breakdown });
  } catch (error) {
    console.error("Error getBreakdownMetodePembayaran:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getLatestTransaksi = async (req, res) => {
  try {
    // Ambil hanya 10 transaksi terbaru, urut dari yang paling baru
    const transaksi = await Transaksi.find()
      .sort({ createdAt: -1 }) // urut dari terbaru
      .limit(10);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getLatestTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};
