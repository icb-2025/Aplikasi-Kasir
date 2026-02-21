import Laporan from "../../models/datalaporan.js";
import BiayaOperasional from "../../models/biayaoperasional.js"; 
import PengeluaranBiaya from "../../models/pengeluaranbiaya.js";


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

// Ambil ringkasan penjualan (harian/mingguan/bulanan)
export const getRingkasanPenjualan = async (req, res) => {
  try {
    const { jenis } = req.params; // harian, mingguan, bulanan

    const laporan = await Laporan.find().sort({ createdAt: -1 }).limit(1); // ambil laporan terbaru
    if (!laporan || laporan.length === 0) {
      return res.status(404).json({ message: "Laporan belum tersedia" });
    }

    const data = laporan[0].laporan_penjualan[jenis];
    if (!data) {
      return res.status(400).json({ message: `Jenis laporan '${jenis}' tidak valid` });
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

    // Compute laba kotor dynamically from snapshots: subtotal_produk - (hpp * jumlah)
    const computedDetail = (detail || []).map(item => {
      const hpp = item.hpp || 0;
      const harga_produk = item.harga_produk || 0;
      const jumlah = item.jumlah || 0;
      const subtotal_produk = item.subtotal_produk || (harga_produk * jumlah);
      const subtotal_final = item.subtotal_final || 0;

      const labaPerItem = harga_produk - hpp;
      const totalLaba = labaPerItem * jumlah; // same as subtotal_produk - (hpp * jumlah)

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

    // Hitung total pengeluaran biaya untuk periode laporan dari collection pengeluaran_biaya
    let totalBiayaOperasional = 0;
    try {
      const start = currentLaporan.periode.start ? new Date(currentLaporan.periode.start) : null;
      const end = currentLaporan.periode.end ? new Date(currentLaporan.periode.end) : null;
      const match = {};
      if (start && end) match.tanggal = { $gte: start, $lte: end };
      const agg = await PengeluaranBiaya.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$jumlah" } } }
      ]);
      totalBiayaOperasional = agg && agg[0] ? agg[0].total : 0;
    } catch (e) {
      console.warn("Gagal menghitung total biaya operasional untuk laporan:", e.message);
      totalBiayaOperasional = 0;
    }

    const totalLabaBersih = totalLabaKotor - totalBiayaOperasional;

    // Do NOT persist derived profit values to DB. Return computed summary instead.
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

export const getDaftarBulanLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.find().sort({ "periode.start": -1 });

    const daftarBulan = laporan.map((lap) => {
      const date = new Date(lap.periode.start);
      const namaBulan = date.toLocaleString("id-ID", { month: "long" });
      const tahun = date.getFullYear();

      return {
        id: lap._id,
        nama_bulan: `${namaBulan} ${tahun}`,
        bulan: date.getMonth() + 1,
        tahun,
        createdAt: lap.createdAt,
      };
    });

    res.json({ daftar_bulan: daftarBulan });
  } catch (err) {
    console.error("Gagal mengambil daftar bulan:", err);
    res.status(500).json({ message: "Gagal mengambil daftar bulan laporan" });
  }
};

export const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    const laporan = await Laporan.findById(id).populate("biaya_operasional_id");

    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    res.json(laporan);
  } catch (err) {
    console.error("Gagal mengambil laporan:", err);
    res.status(500).json({ message: "Gagal mengambil laporan bulanan" });
  }
};

