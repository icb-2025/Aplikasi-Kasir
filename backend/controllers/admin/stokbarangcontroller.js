import Barang from "../../models/databarang.js";
import Settings from "../../models/settings.js";
import db from "../../config/firebaseAdmin.js";
import { io } from "../../server.js";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import BiayaOperasional from "../../models/biayaoperasional.js";
import { kurangiModalUtama } from "./utils/updatemodalutama.js";



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
      stok,
      stok_minimal,
      bahan_baku, 
      margin = 0,
    } = req.body;

    if (!kategori) {
      return res.status(400).json({ message: "Kategori wajib diisi." });
    }

    // Parse bahan_baku (stringified JSON kalau dikirim via form-data)
    let bahanParsed = [];
    try {
      bahanParsed = typeof bahan_baku === "string" ? JSON.parse(bahan_baku) : bahan_baku;
    } catch (err) {
      bahanParsed = [];
    }

    // 🧮 Hitung total harga beli
    let totalHargaBeli = 0;
    bahanParsed.forEach((produk) => {
      const subtotal = produk.bahan.reduce((acc, b) => acc + (b.harga || 0), 0);
      totalHargaBeli += subtotal;
    });
    totalHargaBeli *= stok || 1;

    // 💰 Hitung harga jual otomatis (harga beli + margin%)
    const hargaJual = totalHargaBeli + (totalHargaBeli * (margin / 100));

    // Upload gambar (opsional)
    let gambarUrl = "";
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, { folder: "barang" });
      gambarUrl = upload.secure_url;
    }

    // Simpan barang
    const barang = new Barang({
      kode_barang,
      nama_barang,
      kategori,
      harga_beli: totalHargaBeli,
      harga_jual: hargaJual,
      stok,
      stok_minimal,
      bahan_baku: bahanParsed,
      total_harga_beli: totalHargaBeli,
      margin,
      hargaFinal: hargaJual,
      gambar_url: gambarUrl,
    });

    await barang.save();

    // Kurangi modal utama
    if (totalHargaBeli > 0) {
      await kurangiModalUtama(totalHargaBeli, `Pembelian bahan baku untuk ${nama_barang}`);
    }

    res.status(201).json({
      message: "Barang berhasil dibuat!",
      data: barang,
      perhitungan: {
        totalHargaBeli,
        hargaJual,
        margin: `${margin}%`,
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

    const margin = Number(req.body.margin) || 0;
    const hargaBeli = Number(req.body.harga_beli) || 0;
    const hargaJualDasar = hargaBeli + (hargaBeli * (margin / 100));

    // parse per-item use_discount flag
    let useDiscount = true;
    const rawUse = typeof req.body.use_discount !== "undefined" ? req.body.use_discount : req.body.useDiscount;
    if (typeof rawUse !== "undefined") {
      if (typeof rawUse === "string") useDiscount = rawUse === "true";
      else if (typeof rawUse === "boolean") useDiscount = rawUse;
      else useDiscount = Boolean(rawUse);
    }

    // ✅ kalkulasi harga final dengan diskon, pajak, dan service charge
    const effectiveDiscount = useDiscount ? globalDiscount : 0;
    const hargaSetelahDiskon = hargaJualDasar - (hargaJualDasar * effectiveDiscount) / 100;
    const hargaSetelahPajak = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
    const hargaFinal = hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;

    let updateData = {
      ...req.body,
      margin,
      harga_jual: Math.round(hargaJualDasar),
      hargaFinal: Math.round(hargaFinal),
      use_discount: useDiscount,
    };

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "barang",
      });
      updateData.gambar_url = upload.secure_url;
    }

    const barang = await Barang.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });

    const id = barang._id.toString();
    if (db) {
      await db.ref(`/barang/${id}`).update({
        stok: barang.stok || 0,
        nama: barang.nama_barang,
        harga_jual: barang.harga_jual,
        harga_final: Math.round(hargaFinal),
        kategori: barang.kategori,
        use_discount: updateData.use_discount,
      });
    }

    io.emit("barang:updated", barang);

    res.json({
      message: "Barang berhasil diperbarui!",
      barang,
      perhitungan: {
        hargaBeli,
        margin: `${margin}%`,
        hargaJual: hargaJualDasar,
        hargaFinal,
      },
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
