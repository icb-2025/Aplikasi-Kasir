import ModalUtama from "../../models/modalutama.js";
import HppHarian from "../../models/hpptotal.js";
import BiayaLayanan from "../../models/biayalayanan.js";
import BiayaOperasional from "../../models/biayaoperasional.js";
import PengeluaranBiaya from "../../models/pengeluaranbiaya.js";

// =======================================================
// OTOMATIS UPDATE HPP HARIAN SAAT ADA TRANSAKSI
// =======================================================
export const getHppHarian = async (req, res) => {
  try {
    const { tanggal, startDate, endDate } = req.query;

    let hppData;

    // --- KASUS 1: Ambil data untuk tanggal spesifik ---
    if (tanggal) {
      hppData = await HppHarian.findOne({ tanggal });
    } 
    
    // --- KASUS 2: Ambil data untuk rentang tanggal ---
    else if (startDate && endDate) {
      hppData = await HppHarian.find({
        tanggal: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ tanggal: -1 });
    } 
    
    // --- KASUS 3: Ambil SEMUA DATA jika tidak ada query sama sekali ---
    else if (!tanggal && !startDate && !endDate) {
      hppData = await HppHarian.find().sort({ tanggal: -1 });
    }

    res.json({
      success: true,
      data: hppData,
    });

  } catch (err) {
    console.error("Error saat mengambil data HPP:", err);
    res.status(500).json({ 
      message: "Gagal mengambil data HPP", 
      error: err.message 
    });
  }
};

export const getHppSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.tanggal = { $gte: startDate, $lte: endDate };
    }

    const data = await HppHarian.find(filter).sort({ tanggal: 1 });

    if (!data.length) {
      return res.json({
        success: true,
        summary: {
          total_hpp: 0,
          total_pendapatan: 0,
          total_laba_kotor: 0,
          total_beban: 0,
          total_laba_bersih: 0
        },
        data: []
      });
    }

    // Ambil biaya
    const biayaLayanan = await BiayaLayanan.findOne();
    const persenLayanan = biayaLayanan?.persen || 0;

    // Hitung pengeluaran operasional bulan ini dari collection pengeluaran_biaya
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23,59,59,999);
    const agg = await PengeluaranBiaya.aggregate([
      { $match: { tanggal: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$jumlah" } } }
    ]);

    const biayaOperasionalBulanan = agg && agg[0] ? agg[0].total : 0;

    // Akumulasi harian
    let totalPendapatan = 0;
    let totalHpp = 0;
    let totalLabaKotor = 0;

    data.forEach(d => {
      totalPendapatan += d.total_pendapatan || 0;
      totalHpp += d.total_hpp || 0;
      totalLabaKotor += d.total_laba_kotor || 0;
    });

    // Hitung beban bulanan
    const totalBiayaLayanan = (persenLayanan / 100) * totalPendapatan;

    const totalBeban = totalBiayaLayanan + biayaOperasionalBulanan;

    const labaBersih = totalPendapatan - totalHpp - totalBeban;

    res.json({
      success: true,
      summary: {
        total_hpp: totalHpp,
        total_pendapatan: totalPendapatan,
        total_laba_kotor: totalLabaKotor,
        total_beban: totalBeban,
        total_laba_bersih: labaBersih
      },
      data
    });

  } catch (err) {
    console.error("Error summary HPP:", err);
    res.status(500).json({ message: err.message });
  }
};


export const addTransaksiToHpp = async (req, res) => {
  try {
    // Keep backward-compatible HTTP handler: delegate to helper
    const { nama_produk, jumlah_terjual } = req.body;
    const hppHarian = await upsertHppForSale(nama_produk, jumlah_terjual);
    return res.json({ success: true, data: hppHarian });

  } catch (err) {
    console.error("Error addTransaksiToHpp:", err);
    res.status(500).json({ message: err.message });
  }
};

// Helper: update HPP harian given product name and sold quantity
export const upsertHppForSale = async (nama_produk, jumlah_terjual) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const modalUtama = await ModalUtama.findOne();
    if (!modalUtama) {
      throw new Error("Data modal utama tidak ditemukan");
    }

    // Cari produk di modal utama
    const produkData = modalUtama.bahan_baku.find(
      p => p.nama_produk.toLowerCase().trim() === String(nama_produk).toLowerCase().trim()
    );

    if (!produkData) {
      throw new Error(`Produk ${nama_produk} tidak ditemukan.`);
    }

    const jumlah = Number(jumlah_terjual) || 0;
    const hpp_per_porsi = produkData.modal_per_porsi || 0;
    const harga_jual = produkData.harga_jual || 0;

    const hpp_total = hpp_per_porsi * jumlah;
    const pendapatan = harga_jual * jumlah;
    const laba_kotor = pendapatan - hpp_total;

    // Ambil dokumen harian
    let hppHarian = await HppHarian.findOne({ tanggal: today });

    if (!hppHarian) {
      hppHarian = new HppHarian({
        tanggal: today,
        produk: [],
        total_hpp: 0,
        total_pendapatan: 0,
        total_laba_kotor: 0
      });
    }

    // Update atau tambah item produk
    const index = hppHarian.produk.findIndex(
      p => p.nama_produk.toLowerCase().trim() === String(nama_produk).toLowerCase().trim()
    );

    if (index !== -1) {
      hppHarian.produk[index].jumlah_terjual = (hppHarian.produk[index].jumlah_terjual || 0) + jumlah;
      hppHarian.produk[index].hpp_total = (hppHarian.produk[index].hpp_total || 0) + hpp_total;
      hppHarian.produk[index].pendapatan = (hppHarian.produk[index].pendapatan || 0) + pendapatan;
      hppHarian.produk[index].laba_kotor = (hppHarian.produk[index].laba_kotor || 0) + laba_kotor;
    } else {
      hppHarian.produk.push({
        nama_produk,
        jumlah_terjual: jumlah,
        hpp_per_porsi,
        hpp_total,
        pendapatan,
        laba_kotor
      });
    }

    // Update total harian (TANPA BEBAN!)
    hppHarian.total_hpp = (hppHarian.total_hpp || 0) + hpp_total;
    hppHarian.total_pendapatan = (hppHarian.total_pendapatan || 0) + pendapatan;
    hppHarian.total_laba_kotor = (hppHarian.total_laba_kotor || 0) + laba_kotor;

    await hppHarian.save();

    return hppHarian;
  } catch (err) {
    console.error("Error upsertHppForSale:", err);
    throw err;
  }
};
