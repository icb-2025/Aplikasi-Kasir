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

    const totalLabaKotor = detail.reduce((acc, item) => acc + (item.laba || 0), 0);

    const totalBiayaOperasional = currentLaporan.biaya_operasional_id?.total || 0;
    const totalLabaBersih = totalLabaKotor - totalBiayaOperasional;

    // Update total_laba dengan laba bersih
    currentLaporan.laba.total_laba = totalLabaBersih;
    await currentLaporan.save();

    res.json({
      ringkasan: {
        total_laba_kotor: totalLabaKotor,
        total_biaya_operasional: totalBiayaOperasional,
        total_laba_bersih: totalLabaBersih
      },
      detail_laba: detail,
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

