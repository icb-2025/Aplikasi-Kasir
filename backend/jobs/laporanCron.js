import cron from "node-cron";
import Laporan from "../models/datalaporan.js";

// Fungsi rekap harian → mingguan
const rekapHarianKeMingguan = async () => {
  const now = new Date();

  // Cari laporan bulan ini
  const laporanBulanIni = await Laporan.findOne({
    "periode.start": { $lte: now },
    "periode.end": { $gte: now },
  });

  if (!laporanBulanIni) return;

  const mingguan = laporanBulanIni.laporan_penjualan.mingguan;
  const harian = laporanBulanIni.laporan_penjualan.harian;

  // Hitung minggu keberapa (1–5)
  const mingguKe = Math.ceil(now.getDate() / 7);
  let laporanMingguan = mingguan.find((m) => m.minggu === mingguKe);

  if (!laporanMingguan) {
    laporanMingguan = { minggu: mingguKe, hari: [], total_mingguan: 0 };
    mingguan.push(laporanMingguan);
  }

  // Tambahkan semua harian yang belum masuk
  harian.forEach((h) => {
    const sudahAda = laporanMingguan.hari.find((x) => x.tanggal === h.tanggal);
    if (!sudahAda) {
      laporanMingguan.hari.push(h);
      laporanMingguan.total_mingguan += h.total_harian;
    }
  });

  await laporanBulanIni.save();
  console.log("✅ Rekap harian → mingguan selesai.");
};

// Jadwalkan tiap jam 23:59
cron.schedule("59 23 * * *", async () => {
  console.log("⏳ Menjalankan rekap harian ke mingguan...");
  await rekapHarianKeMingguan();
});

// TODO: bikin fungsi rekapMingguanKeBulanan mirip di atas
