import Transaksi from "../../models/datatransaksi.js";
import {addTransaksiToLaporan} from "../datatransaksiController.js"
/**
 * Ambil semua pesanan berdasarkan status
 * Contoh: GET /status?status=pending
 */
/**
 * Update status pesanan
 * Contoh: PUT /status/:id  { "status": "selesai" }
 */

export const getAllPesanan = async (req, res) => {
  try {
    const pesanan = await Transaksi.find().sort({ createdAt: -1 }).limit(10);
    res.json(pesanan);
  } catch (error) {
    console.error("Error getAllPesanan:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateStatusPesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending", "diproses", "selesai", "dibatalkan"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Pilih salah satu dari: ${allowedStatus.join(", ")}`
      });
    }

    const pesanan = await Transaksi.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    res.json({ message: "Status pesanan berhasil diperbarui", pesanan });
  } catch (error) {
    console.error("Error updateStatusPesanan:", error);
    res.status(500).json({ message: error.message });
  }
};

export const approvePesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const pesanan = await Transaksi.findById(id);
    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    if (pesanan.status !== "pending") {
      return res.status(400).json({ message: "Hanya pesanan pending yang bisa di-ACC" });
    }

    // Update jadi selesai
    pesanan.status = "selesai";
    await pesanan.save();

    // Masukkan ke laporan penjualan
    await addTransaksiToLaporan(pesanan);

    res.json({ message: "Pesanan berhasil di-ACC", pesanan });
  } catch (error) {
    console.error("Error approvePesanan:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Batalkan pesanan (stok dikembalikan)
 */
export const cancelPesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const pesanan = await Transaksi.findById(id);
    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    if (pesanan.status === "selesai") {
      return res.status(400).json({ message: "Pesanan yang sudah selesai tidak bisa dibatalkan" });
    }

    // Kembalikan stok
    for (const item of pesanan.barang_dibeli) {
      const barang = await Barang.findOne({ kode_barang: item.kode_barang });
      if (barang) {
        barang.stok += item.jumlah;
        await barang.save();
      }
    }

    pesanan.status = "dibatalkan";
    await pesanan.save();

    res.json({ message: "Pesanan berhasil dibatalkan & stok dikembalikan", pesanan });
  } catch (error) {
    console.error("Error cancelPesanan:", error);
    res.status(500).json({ message: error.message });
  }
};