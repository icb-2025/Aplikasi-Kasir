import Laporan from "../../models/datalaporan.js";
import BiayaOperasional from "../../models/biayaoperasional.js"; 

// Ambil semua laporan
export const getAllLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.find().sort({ createdAt: -1 });
    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ambil laporan berdasarkan periode
export const getLaporanByPeriode = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Harap sertakan parameter start dan end" });
    }

    const laporan = await Laporan.findOne({
      "periode.start": { $gte: new Date(start) },
      "periode.end": { $lte: new Date(end) }
    });

    if (!laporan) {
      return res.status(404).json({ message: "Laporan untuk periode ini tidak ditemukan" });
    }

    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function getDateRange(jenis) {
  const now = new Date();
  let start, end;

  if (jenis === "minggu_lalu") {
    // Cari Senin minggu lalu
    const day = now.getDay(); // Minggu=0, Senin=1
    const diffToMonday = (day + 6) % 7; 
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday - 1, 23, 59, 59);
    start = new Date(end);
    start.setDate(start.getDate() - 6);
  }

  if (jenis === "bulan_lalu") {
    const bulanLalu = now.getMonth() - 1;
    const tahun = bulanLalu < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const bulan = (bulanLalu + 12) % 12;

    start = new Date(tahun, bulan, 1, 0, 0, 0);
    end = new Date(tahun, bulan + 1, 0, 23, 59, 59); // hari terakhir bulan lalu
  }

  return { start, end };
}


// Ambil ringkasan penjualan (harian/mingguan/bulanan)
export const getRingkasanPenjualan = async (req, res) => {
  try {
    const { jenis } = req.params; // harian/mingguan/bulanan
    const { periode } = req.query; // contoh: minggu_lalu / bulan_lalu

    const laporan = await Laporan.findOne().sort({ createdAt: -1 });
    if (!laporan) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }

    let data = laporan.laporan_penjualan[jenis] || [];

    if (periode === "minggu_lalu" || periode === "bulan_lalu") {
      const { start, end } = getDateRange(periode);

      if (jenis === "harian") {
        data = data.filter(item =>
          new Date(item.tanggal) >= start && new Date(item.tanggal) <= end
        );
      }

      if (jenis === "bulanan" && periode === "bulan_lalu") {
        const bulanStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
        data = data.filter(item => item.bulan === bulanStr);
      }
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Ambil rekap metode pembayaran
export const getRekapMetodePembayaran = async (req, res) => {
  try {
    const laporan = await Laporan.find().sort({ createdAt: -1 }).limit(1);
    if (!laporan || laporan.length === 0) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }

    res.json(laporan[0].rekap_metode_pembayaran);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ambil data laba
export const getLaba = async (req, res) => {
  try {
    const laporan = await Laporan.find()
      .sort({ createdAt: -1 })
      .limit(1)
      .populate("biaya_operasional_id"); 

    if (!laporan || laporan.length === 0) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }
    const currentLaporan = laporan[0];
    const detail = currentLaporan.laba.detail || [];

    const computedDetail = (detail || []).map(item => {
      const hpp = item.hpp || 0;
      const harga_produk = item.harga_produk || 0;
      const jumlah = item.jumlah || 0;
      const subtotal_produk = item.subtotal_produk || (harga_produk * jumlah);
      const subtotal_final = item.subtotal_final || 0;

      const labaPerItem = harga_produk - hpp;
      const totalLaba = labaPerItem * jumlah;

      return {
        produk: item.produk,
        kode_barang: item.kode_barang,
        harga_jual: harga_produk,
        harga_beli: hpp,
        labaPerItem,
        jumlahTerjual: jumlah,
        totalLaba,
        subtotal_produk,
        subtotal_final
      };
    });

    const totalLabaKotor = computedDetail.reduce((acc, it) => acc + (it.totalLaba || 0), 0);
    const totalBiayaOperasional = currentLaporan.biaya_operasional_id?.total || 0;
    const totalLabaBersih = totalLabaKotor - totalBiayaOperasional;

    res.json({
      ringkasan: {
        total_laba_kotor: totalLabaKotor,
        total_biaya_operasional: totalBiayaOperasional,
        total_laba_bersih: totalLabaBersih
      },
      detail_laba: computedDetail,
      biaya_operasional: currentLaporan.biaya_operasional_id || {}
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Ambil daftar tanggal dari laporan harian
export const getTanggalHarian = async (req, res) => {
  try {
    const laporan = await Laporan.find().sort({ createdAt: -1 }).limit(1); // ambil laporan terbaru
    if (!laporan || laporan.length === 0) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }

    // Ambil array harian
    const harian = laporan[0].laporan_penjualan.harian || [];

    // Map hanya ambil tanggal
    const tanggalList = harian.map((item) => ({
      tanggal: item.tanggal,
    }));

    res.json(tanggalList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Ambil total penjualan
export const getTotalPenjualan = async (req, res) => {
  try {
    const laporan = await Laporan.find().sort({ createdAt: -1 }).limit(1);
    if (!laporan || laporan.length === 0) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }

    const rekap = laporan[0].rekap_metode_pembayaran || [];
    // jumlahkan semua total metode pembayaran
    const total_penjualan = rekap.reduce((acc, item) => acc + (item.total || 0), 0);

    res.json({ total_penjualan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
