// backend/controllers/transaksi/helpers/laporanHelper.js

import mongoose from "mongoose";
import Laporan from "../../../models/datalaporan.js";
import Barang from "../../../models/databarang.js";
import BiayaOperasional from "../../../models/biayaoperasional.js";

export const addTransaksiToLaporan = async (transaksi) => {
  try {
    const tanggal = transaksi.tanggal_transaksi
      ? new Date(transaksi.tanggal_transaksi)
      : new Date();

    const startBulan = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1, 0, 0, 0, 0);
    const endBulan = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0, 23, 59, 59, 999);

    let laporan = await Laporan.findOne({
      "periode.start": { $lte: tanggal },
      "periode.end": { $gte: tanggal }
    });

    if (!laporan) {
      const biayaTerbaru = await BiayaOperasional.findOne().sort({ createdAt: -1 });

      const semuaBarang = await Barang.find();
      const totalPengeluaran = semuaBarang.reduce((acc, b) => acc + (b.harga_beli * b.stok), 0);

      laporan = new Laporan({
        periode: { start: startBulan, end: endBulan },
        laporan_penjualan: { harian: [], mingguan: [], bulanan: [] },
        laba: { total_laba: 0, detail: [] },
        rekap_metode_pembayaran: [],
        biaya_operasional_id: biayaTerbaru?._id,
        pengeluaran: totalPengeluaran
      });
    }

    const tanggalHarian = tanggal.toISOString().split("T")[0];
    let laporanHarian = laporan.laporan_penjualan.harian.find((h) => {
      if (!h) return false;
      if (h.tanggal instanceof Date) return h.tanggal.toISOString().split("T")[0] === tanggalHarian;
      return String(h.tanggal) === tanggalHarian;
    });

    if (!laporanHarian) {
      laporanHarian = {
        tanggal: tanggalHarian,
        transaksi: [],
        total_harian: 0,
      };
      laporan.laporan_penjualan.harian.push(laporanHarian);
    }

    let totalHargaFix = 0;

    transaksi.barang_dibeli = await Promise.all(
      transaksi.barang_dibeli.map(async (barang) => {
        const jumlah = barang.jumlah || 1;
        const hargaJual = barang.harga_satuan || 0;

        const produk = await Barang.findOne({
          $or: [
            (mongoose.Types.ObjectId.isValid(barang.kode_barang)
              ? { _id: new mongoose.Types.ObjectId(barang.kode_barang) }
              : null),
            { kode_barang: barang.kode_barang },
            { nama_barang: barang.nama_barang },
          ].filter(Boolean),
        });

        const hargaBeli = produk ? produk.harga_beli : 0;

        const subtotal = hargaJual * jumlah;
        const labaItem = (hargaJual - hargaBeli) * jumlah;

        totalHargaFix += subtotal;

        laporan.laba.detail.push({
          nomor_transaksi: transaksi.nomor_transaksi,
          kode_barang: barang.kode_barang,
          produk: barang.nama_barang,
          harga_jual: hargaJual,
          harga_beli: hargaBeli,
          jumlah,
          subtotal,
          laba: labaItem,
        });

        return {
          ...barang,
          harga_satuan: hargaJual,
          subtotal,
          harga_beli: hargaBeli,
        };
      })
    );

    transaksi.total_harga = totalHargaFix;

    laporanHarian.transaksi.push({
      nomor_transaksi: transaksi.nomor_transaksi,
      total_harga: transaksi.total_harga,
      barang_dibeli: transaksi.barang_dibeli,
      tanggal_transaksi: tanggal,
    });

    laporanHarian.total_harian += transaksi.total_harga;

    const existingRekap = laporan.rekap_metode_pembayaran.find(
      (r) => r.metode === transaksi.metode_pembayaran
    );

    if (existingRekap) {
      existingRekap.total += transaksi.total_harga;
    } else {
      laporan.rekap_metode_pembayaran.push({
        metode: transaksi.metode_pembayaran,
        total: transaksi.total_harga,
      });
    }

    const totalLabaKotor = laporan.laba.detail.reduce((acc, item) => acc + (item.laba || 0), 0);

    const biayaOperasional = await BiayaOperasional.findById(laporan.biaya_operasional_id);
    const totalBiayaOperasional = biayaOperasional?.total || 0;

    laporan.laba.total_laba =
      totalLabaKotor - totalBiayaOperasional - (laporan.pengeluaran || 0);

    await laporan.save();

    console.log("✅ Transaksi berhasil disimpan dan laporan diperbarui");
  } catch (err) {
    console.error("❌ Gagal menambahkan ke laporan:", err);
  }
};