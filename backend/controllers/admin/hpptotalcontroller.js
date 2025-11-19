import ModalUtama from "../../models/modalutama.js";
import HppHarian from "../../models/hpptotal.js";
import BiayaLayanan from "../../models/biayalayanan.js";
import BiayaOperasional from "../../models/biayaoperasional.js";

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

    // Ambil data sesuai rentang (mingguan / bulanan)
    const filter = {};
    if (startDate && endDate) {
      filter.tanggal = { $gte: startDate, $lte: endDate };
    }

    const data = await HppHarian.find(filter).sort({ tanggal: 1 });

    if (!data || data.length === 0) {
      return res.json({
        success: true,
        summary: {
          total_hpp: 0,
          total_pendapatan: 0,
          total_laba_kotor: 0,
          total_beban: 0,
          total_laba_bersih: 0,
        },
        data: []
      });
    }

    // Ambil biaya layanan & operasional
    const biayaLayanan = await BiayaLayanan.findOne();
    const biayaOperasional = await BiayaOperasional.findOne();

    const persenLayanan = biayaLayanan?.persen || 0;
    const biayaOperasionalBulanan = biayaOperasional?.total || 0;

    // === AKUMULASI PENDAPATAN, HPP, LABA KOTOR ===
    let totalPendapatan = 0;
    let totalHpp = 0;
    let totalLabaKotor = 0;

    // === BIAYA LAYANAN DIJUMAHKAN PERHARI ===
    let totalBiayaLayanan = 0;

    data.forEach(item => {
      const pendapatan = item.total_pendapatan || 0;

      totalPendapatan += pendapatan;
      totalHpp += item.total_hpp || 0;
      totalLabaKotor += item.total_laba_kotor || 0;

      // biaya layanan harian
      totalBiayaLayanan += (persenLayanan / 100) * pendapatan;
    });

    // === TOTAL BEBAN = BIAYA LAYANAN + OPERASIONAL (1x) ===
    const totalBeban = totalBiayaLayanan + biayaOperasionalBulanan;

    // === RUMUS LABA BERSIH ===
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
    res.status(500).json({ message: "Gagal menghitung summary", error: err.message });
  }
};


export const addTransaksiToHpp = async (req, res) => {
  try {
    const { nama_produk, jumlah_terjual } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    // 1. Ambil semua data yang dibutuhkan
    const modalUtama = await ModalUtama.findOne();
    if (!modalUtama) {
      return res.status(404).json({ message: "Data modal utama tidak ditemukan" });
    }

    const biayaLayanan = await BiayaLayanan.findOne();
    const biayaOperasional = await BiayaOperasional.findOne();
    if (!biayaLayanan || !biayaOperasional) {
      return res.status(404).json({ message: "Data biaya tidak lengkap, tidak bisa menghitung laba bersih." });
    }

    // 2. Cari produk di modal utama (PERBAIKAN)
    const produkData = modalUtama.bahan_baku.find(
      p => p.nama_produk.toLowerCase().trim() === nama_produk.toLowerCase().trim()
    );

    if (!produkData) {
      return res.status(404).json({ message: `Produk ${nama_produk} tidak ditemukan di data modal utama.` });
    }

    // 3. Hitung nilai untuk transaksi ini
    const jumlah = Number(jumlah_terjual);
    const hpp_per_porsi = produkData.modal_per_porsi;
    const harga_jual = produkData.harga_jual; // Pastikan ini adalah harga jual per porsi

    const hpp_total = hpp_per_porsi * jumlah;
    const pendapatan = harga_jual * jumlah;
    const laba_kotor = pendapatan - hpp_total;

    // 4. Cari dokumen HPP hari ini atau buat baru
  let hppHarian = await HppHarian.findOne({ tanggal: today });

if (!hppHarian) {
  hppHarian = new HppHarian({
    tanggal: today,
    produk: [],
    total_hpp: 0,
    total_pendapatan: 0,
    total_laba_kotor: 0,
    total_beban: 0,
    laba_bersih: 0
  });
} else {
  // pastikan data tidak membawa nilai lama
  hppHarian.produk = hppHarian.produk || [];
  hppHarian.total_hpp = hppHarian.total_hpp || 0;
  hppHarian.total_pendapatan = hppHarian.total_pendapatan || 0;
  hppHarian.total_laba_kotor = hppHarian.total_laba_kotor || 0;
  hppHarian.total_beban = 0; // reset setiap hari
  hppHarian.laba_bersih = 0; // reset setiap hari
}


    if (!hppHarian) {
      hppHarian = new HppHarian({
        tanggal: today,
        produk: [],
        total_hpp: 0,
        total_pendapatan: 0,
        total_laba_kotor: 0,
        total_beban: 0,
        laba_bersih: 0
      });
    }

    // 5. Cek apakah produk sudah ada, lalu update atau tambahkan (PERBAIKAN)
    const existingProductIndex = hppHarian.produk.findIndex(
      p => p.nama_produk.toLowerCase().trim() === nama_produk.toLowerCase().trim()
    );

    if (existingProductIndex !== -1) {
      // Jika produk sudah ada, update nilainya
      const existingProduct = hppHarian.produk[existingProductIndex];
      existingProduct.jumlah_terjual += jumlah;
      existingProduct.hpp_total += hpp_total;
      existingProduct.pendapatan += pendapatan;
      existingProduct.laba_kotor += laba_kotor;
    } else {
      // Jika produk belum ada, tambahkan sebagai produk baru
      hppHarian.produk.push({
        nama_produk,
        jumlah_terjual: jumlah,
        hpp_per_porsi,
        hpp_total,
        pendapatan,
        laba_kotor
      });
    }

    // 6. Update total harian
    hppHarian.total_hpp += hpp_total;
    hppHarian.total_pendapatan += pendapatan;
    hppHarian.total_laba_kotor += laba_kotor;

    // 7. Hitung total beban dan laba bersih berdasarkan total yang sudah terakumulasi
    const biayaLayananHariIni = (biayaLayanan.persen / 100) * hppHarian.total_pendapatan;
    const bebanOperasionalPerHari = biayaOperasional.total / 30; // bagi bulanan jadi harian
    const totalBebanHariIni = biayaLayananHariIni + bebanOperasionalPerHari;

    const labaBersihHariIni = hppHarian.total_laba_kotor - totalBebanHariIni;
    
    hppHarian.total_beban = totalBebanHariIni;
    hppHarian.laba_bersih = labaBersihHariIni;

    // 8. Simpan ke database
    await hppHarian.save();

    res.json({ success: true, data: hppHarian });

  } catch (err) {
    console.error("Error di addTransaksiToHpp:", err); // Tambahkan log untuk debugging
    res.status(500).json({ message: err.message });
  }
};