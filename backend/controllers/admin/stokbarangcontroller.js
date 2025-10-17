import Barang from "../../models/databarang.js";
import Settings from "../../models/settings.js";
import db from "../../config/firebaseAdmin.js";
import { io } from "../../server.js";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import BiayaOperasional from "../../models/biayaoperasional.js";



export const getAllBarang = async (req, res) => {
  try {
    const barangList = await Barang.find().lean();

    let stokMap = {};
    if (db) {
      try {
        const snap = await db.ref("/barang").once("value");
        const data = snap.val() || {};
        Object.keys(data).forEach((k) => {
          if (data[k] && typeof data[k].stok !== "undefined") {
            stokMap[k] = data[k].stok;
          }
        });
      } catch (e) {
        console.warn("⚠️ Gagal ambil stok RTDB:", e.message);
      }
    }

    const barangWithStock = barangList.map((item) => {
      const id = item._id.toString();
      const stokRTDB = stokMap[id];
      const stok = typeof stokRTDB === "number" ? stokRTDB : item.stok;

      let status = "aman";
      if (stok === 0) status = "habis";
      else if (stok <= (item.stok_minimal || 5)) status = "hampir habis";

      return {
        ...item,
        stok,
        status,
        hargaFinal: Math.round(item.hargaFinal),
      };
    });

    res.json(barangWithStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Tambah barang baru
export const createBarang = async (req, res) => {
  try {
    const {
      kode_barang,
      nama_barang,
      kategori,
      harga_beli,
      harga_jual,
      stok,
      stok_minimal,
    } = req.body;

    if (!kategori) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const settings = await Settings.findOne();
    const taxRate = settings?.taxRate ?? 0;
    const globalDiscount = settings?.globalDiscount ?? 0;
    const serviceCharge = settings?.serviceCharge ?? 0;

    const biayaOp = await BiayaOperasional.findOne();
    const totalBiayaOperasional = biayaOp?.total || 0;

    let gambarUrl = "";
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "barang",
      });
      gambarUrl = upload.secure_url;
    }

    const hargaJual = Number(harga_jual) || 0;
    const hargaSetelahDiskon = hargaJual - (hargaJual * globalDiscount) / 100;
    const hargaSetelahPajak =
      hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
    const hargaFinal =
      hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;

    const barang = new Barang({
      kode_barang,
      nama_barang,
      kategori, 
      harga_beli,
      harga_jual,
      stok,
      stok_minimal,
      hargaFinal: Math.round(hargaFinal),
      gambar_url: gambarUrl,
    });

    await barang.save();

    const barangId = barang._id.toString();
    if (db) {
      await db.ref(`/barang/${barangId}`).set({
        stok: barang.stok || 0,
        nama: barang.nama_barang,
        harga_jual: hargaJual,
        harga_final: Math.round(hargaFinal),
        kategori,
      });
    }

    io.emit("barang:created", barang);

    res.status(201).json({
      message: "Barang berhasil ditambahkan!",
      barang,
      perhitungan: {
        harga_jual: hargaJual,
        globalDiscount: `${globalDiscount}%`,
        taxRate: `${taxRate}%`,
        serviceCharge: `${serviceCharge}%`,
        total_harga_final: Math.round(hargaFinal),
        totalBiayaOperasional,
      },
    });
  } catch (error) {
    console.error("❌ Error createBarang:", error);
    res.status(400).json({ message: error.message });
  }
};


export const updateBarang = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const taxRate = settings?.taxRate ?? 0;
    const globalDiscount = settings?.globalDiscount ?? 0;
    const serviceCharge = settings?.serviceCharge ?? 0;

    const hargaJual = Number(req.body.harga_jual) || 0;
    const hargaSetelahDiskon = hargaJual - (hargaJual * globalDiscount) / 100;
    const hargaSetelahPajak =
      hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
    const hargaFinal =
      hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;

    let updateData = {
      ...req.body,
      hargaFinal: Math.round(hargaFinal),
    };

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "barang",
      });
      updateData.gambar_url = upload.secure_url;
    }

    const barang = await Barang.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!barang)
      return res.status(404).json({ message: "Barang tidak ditemukan" });

    const id = barang._id.toString();
    if (db) {
      await db.ref(`/barang/${id}`).update({
        stok: barang.stok || 0,
        nama: barang.nama_barang,
        harga_jual: barang.harga_jual,
        harga_final: Math.round(hargaFinal),
        kategori: barang.kategori,
      });
    }

    io.emit("barang:updated", barang);

    res.json({
      message: "Barang berhasil diperbarui!",
      barang,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ✅ Hapus barang
export const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByIdAndDelete(req.params.id);
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });

    await db.ref(`/barang/${req.params.id}`).remove();
    io.emit("barang:deleted", { id: req.params.id });
    
    res.json({ message: "Barang berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Kurangi stok (atomic via RTDB)
export const decrementStock = async (req, res) => {
  const { id } = req.params;
  const qty = parseInt(req.body.qty || "1", 10);
  if (!id || isNaN(qty) || qty <= 0)
    return res.status(400).json({ message: "Invalid id or qty" });

  try {
    const ref = db.ref(`/barang/${id}/stok`);
    const trx = await ref.transaction((cur) => {
      if (cur === null) return 0;
      return Math.max(0, cur - qty);
    });

    if (!trx.committed)
      return res.status(409).json({ message: "Transaksi stok gagal" });

    const newStock = trx.snapshot.val();
    await Barang.findByIdAndUpdate(id, { stok: newStock });
    io.emit("stockUpdated", { id, stok: newStock });

    res.json({ id, stok: newStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
