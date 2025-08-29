import Transaksi from "../models/datatransaksi.js";
import Barang from "../models/databarang.js"; 

// Ambil semua transaksi
export const getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.find();
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaksi = async (req, res) => {
  try {
    const { barang_dibeli } = req.body;

    for (const item of barang_dibeli) {
      const barang = await Barang.findOne({ 
        kode_barang: item.kode_barang 
      }) || await Barang.findOne({ 
        nama_barang: item.nama_barang 
      });


      if (!barang) {
        return res.status(404).json({ message: `Barang ${item.nama_barang} tidak ditemukan!` });
      }

      if (barang.stok < item.jumlah) {
        return res.status(400).json({ message: `Stok ${item.nama_barang} tidak mencukupi!` });
      }
      
      barang.stok -= item.jumlah;
      await barang.save();
    }

    const transaksi = new Transaksi({
      ...req.body,
      tanggal_transaksi: new Date()
    });

    await transaksi.save();

    res.status(201).json({
      message: "Transaksi berhasil ditambahkan & stok semua barang diperbarui!",
      transaksi
    });

  } catch (error) {
    console.error("Error createTransaksi:", error);
    res.status(400).json({ message: error.message });
  }
};

// Hapus transaksi pakai _id
export const deleteTransaksiById = async (req, res) => {
  try {
    const transaksi = await Transaksi.findByIdAndDelete(req.params.id);
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Transaksi berhasil dihapus (pakai _id)!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus transaksi pakai nomor_transaksi
export const deleteTransaksiByNomor = async (req, res) => {
  try {
    const transaksi = await Transaksi.findOneAndDelete({ nomor_transaksi: req.params.nomor_transaksi });
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Transaksi berhasil dihapus (pakai nomor_transaksi)!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};