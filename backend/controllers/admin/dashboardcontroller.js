import Transaksi from "../../models/datatransaksi.js";
import Laporan from "../../models/datalaporan.js";
import Barang from "../../models/databarang.js";
import Kategori from "../../models/kategori.js";

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
    const { bulan } = req.query; // Opsional: 'bulan_ini' atau 'kumulatif' (default: bulan_ini)

    let transaksiSelesai;

    if (bulan === 'kumulatif') {
      transaksiSelesai = await Transaksi.find({ status: "selesai" });
    } else {
      // Default: bulan ini
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      transaksiSelesai = await Transaksi.find({
        status: "selesai",
        tanggal_transaksi: { $gte: startOfMonth, $lte: endOfMonth }
      });
    }

    // Aggregate per product using accounting fields from transaksi
    const barangMap = {};

    transaksiSelesai.forEach(trx => {
      if (!Array.isArray(trx.barang_dibeli)) return;
      trx.barang_dibeli.forEach(item => {
        const key = item.kode_barang || item.nama_barang || item._id || String(item.nama || item.kode || '');

        if (!barangMap[key]) {
          barangMap[key] = {
            kode_barang: item.kode_barang || key,
            nama_barang: item.nama_barang || item.nama || 'Unknown',
            qty: 0,
            pendapatan: 0,
            modal: 0,
            harga_jual_ref: item.harga_satuan || 0
          };
        }

        const qty = Number(item.jumlah) || 0;
        const hargaFinal = Number(item.harga_satuan) || 0; // harga_final
        const hpp = Number(item.harga_beli) || 0; // hpp per porsi

        barangMap[key].qty += qty;
        barangMap[key].pendapatan += hargaFinal * qty;
        barangMap[key].modal += hpp * qty;
      });
    });

    const barangTerlaris = Object.values(barangMap)
      .map(item => ({
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        jumlah_terjual: item.qty,
        harga_jual: item.harga_jual_ref,
        pendapatan: item.pendapatan,
        laba_kotor: item.pendapatan - item.modal
      }))
      .sort((a, b) => b.pendapatan - a.pendapatan)
      .slice(0, 5);

    res.json({
      barang_terlaris: barangTerlaris,
      mode: bulan === 'kumulatif' ? 'kumulatif' : 'bulan_ini'
    });
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

export const updateBestSellerCategory = async (req, res) => {
  try {
    const { bulan } = req.query; // Opsional: 'bulan_ini' atau 'kumulatif' (default: bulan_ini)

    // Pastikan kategori "Best Seller" ada
    let bestSellerKategori = await Kategori.findOne({ nama: "Best Seller ⭐" });
    if (!bestSellerKategori) {
      bestSellerKategori = new Kategori({
        nama: "Best Seller ⭐",
        deskripsi: "Kategori untuk produk Best Seller berdasarkan pendapatan"
      });
      await bestSellerKategori.save();
    }

    let transaksiSelesai;

    if (bulan === 'kumulatif') {
      transaksiSelesai = await Transaksi.find({ status: "selesai" });
    } else {
      // Default: bulan ini
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      transaksiSelesai = await Transaksi.find({
        status: "selesai",
        tanggal_transaksi: { $gte: startOfMonth, $lte: endOfMonth }
      });
    }

    // Hitung barang terlaris berdasarkan pendapatan
    const barangCounter = {};
    transaksiSelesai.forEach(trx => {
      trx.barang_dibeli.forEach(item => {
        if (!barangCounter[item.nama_barang]) {
          barangCounter[item.nama_barang] = 0;
        }
        // Hitung berdasarkan pendapatan (subtotal)
        barangCounter[item.nama_barang] += item.subtotal;
      });
    });

    // Ambil top 5 barang terlaris berdasarkan pendapatan
    const topBarang = Object.entries(barangCounter)
      .map(([nama_barang, pendapatan]) => ({ nama_barang, pendapatan }))
      .sort((a, b) => b.pendapatan - a.pendapatan)
      .slice(0, 5);

    // Reset kategori produk yang sebelumnya Best Seller (opsional, jika ingin dinamis)
    if (bulan === 'bulan_ini') {
      // Cari produk yang kategori-nya "Best Seller ⭐" dan ubah ke kategori lama jika ada
      // Tapi ini rumit, mungkin skip dulu
    }

    // Untuk setiap barang terlaris, update kategori menjadi "Best Seller"
    const updatedBarang = [];
    for (const item of topBarang) {
      const barang = await Barang.findOneAndUpdate(
        { nama_barang: item.nama_barang },
        { kategori: "Best Seller ⭐" },
        { new: true }
      );
      if (barang) {
        updatedBarang.push({
          nama_barang: item.nama_barang,
          pendapatan: item.pendapatan,
          kategori_baru: "Best Seller ⭐"
        });
      }
    }

    res.json({
      message: bulan === 'kumulatif' ? "Kategori Best Seller kumulatif berhasil diperbarui" : "Kategori Best Seller bulan ini berhasil diperbarui",
      mode: bulan === 'kumulatif' ? 'kumulatif' : 'bulan_ini',
      top_barang: topBarang,
      updated_barang: updatedBarang
    });
  } catch (error) {
    console.error("Error updateBestSellerCategory:", error);
    res.status(500).json({ message: error.message });
  }
};
