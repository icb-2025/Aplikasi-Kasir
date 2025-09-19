import Laporan from "../models/datalaporan.js";
import Transaksi from "../models/datatransaksi.js";

// Ambil semua Laporan
export const getAllLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.find();
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah Laporan
export const createLaporan = async (req, res) => {
  try {
    const laporan = new Laporan(req.body);
    await laporan.save();
    res.status(201).json({ message: "Laporan berhasil ditambahkan!", laporan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Laporan
export const updateLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!laporan) return res.status(404).json({ message: "Laporan tidak ditemukan" });
    res.json({ message: "Laporan berhasil diperbarui!", laporan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hapus Laporan
export const deleteLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.findByIdAndDelete(req.params.id);
    if (!laporan) return res.status(404).json({ message: "Laporan tidak ditemukan" });
    res.json({ message: "Laporan berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Fungsi untuk update laporan ketika ada transaksi selesai
export const updateLaporanDenganTransaksi = async (trx) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Cari laporan bulan berjalan
  let laporan = await Laporan.findOne({
    "periode.start": { $lte: now },
    "periode.end": { $gte: now }
  });

  // Kalau belum ada, bikin baru untuk bulan ini
  if (!laporan) {
    laporan = new Laporan({
      laporan_penjualan: { harian: [], mingguan: [], bulanan: [] },
      periode: { start: startOfMonth, end: endOfMonth },
      laba: { total_laba: 0, detail: [] },
      pengeluaran: [],
      rekap_metode_pembayaran: []
    });
  }

  // === Update harian ===
  const tglStr = trx.tanggal_transaksi.toISOString().split("T")[0];
  let harian = laporan.laporan_penjualan.harian.find(h => 
    h.tanggal.toISOString().split("T")[0] === tglStr
  );

  if (!harian) {
    laporan.laporan_penjualan.harian.push({
      tanggal: trx.tanggal_transaksi,
      jumlah_transaksi: 1,
      total_penjualan: trx.total_harga
    });
  } else {
    harian.jumlah_transaksi += 1;
    harian.total_penjualan += trx.total_harga;
  }

  // === Update mingguan ===
  const weekNumber = Math.ceil((trx.tanggal_transaksi.getDate()) / 7);
  let mingguan = laporan.laporan_penjualan.mingguan.find(m => m.minggu_ke === weekNumber);

  if (!mingguan) {
    laporan.laporan_penjualan.mingguan.push({
      minggu_ke: weekNumber,
      jumlah_transaksi: 1,
      total_penjualan: trx.total_harga
    });
  } else {
    mingguan.jumlah_transaksi += 1;
    mingguan.total_penjualan += trx.total_harga;
  }

  // === Update bulanan ===
  const bulanKey = `${trx.tanggal_transaksi.getFullYear()}-${trx.tanggal_transaksi.getMonth() + 1}`;
  let bulanan = laporan.laporan_penjualan.bulanan.find(b => b.bulan === bulanKey);

  if (!bulanan) {
    laporan.laporan_penjualan.bulanan.push({
      bulan: bulanKey,
      jumlah_transaksi: 1,
      total_penjualan: trx.total_harga
    });
  } else {
    bulanan.jumlah_transaksi += 1;
    bulanan.total_penjualan += trx.total_harga;
  }

  // === Update rekap metode pembayaran ===
  let metode = laporan.rekap_metode_pembayaran.find(m => m.metode === trx.metode_pembayaran);
  if (!metode) {
    laporan.rekap_metode_pembayaran.push({
      metode: trx.metode_pembayaran,
      total: trx.total_harga
    });
  } else {
    metode.total += trx.total_harga;
  }

  await laporan.save();
};
