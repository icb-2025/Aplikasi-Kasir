import Barang from "../models/databarang.js";
import Settings from "../models/settings.js";
import db from "../config/firebaseAdmin.js";
import { io } from "../server.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

// Ambil semua barang, menggabungkan stok dari Firebase RTDB jika tersedia
export const getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.find().lean();

    // get all RTDB barang once
    let stokMap = {};
    if (db) {
      try {
        const snap = await db.ref('/barang').once('value');
        const data = snap.val() || {};
        Object.keys(data).forEach(k => {
          if (data[k] && typeof data[k].stok !== 'undefined') stokMap[k] = data[k].stok;
        });
      } catch (e) {
        console.warn('Failed to read RTDB barang:', e.message);
      }
    }

    const barangWithCalc = barang.map(item => {
      const id = item._id && item._id.toString ? item._id.toString() : item._id;
      const stokFromRTDB = stokMap[id];
      const stok = (typeof stokFromRTDB === 'number') ? stokFromRTDB : item.stok;

      let status = "aman";
      if (stok === 0) status = "habis";
      else if (stok <= (item.stok_minimal || 5)) status = "hampir habis";

      return {
        ...item,
        stok,
        hargaFinal: Math.round(item.hargaFinal),
        status
      };
    });

    res.json(barangWithCalc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Tambah barang: simpan ke MongoDB lalu set stok awal ke RTDB
export const createBarang = async (req, res) => {
  try {
    const barang = new Barang(req.body);
    await barang.save();

    if (db) {
      try {
        await db.ref(`/barang/${barang._id.toString()}`).set({
          stok: barang.stok || 0,
          nama: barang.nama || '',
          harga_jual: barang.harga_jual || 0
        });
      } catch (e) {
        console.warn('Failed to write to RTDB:', e.message);
      }
    }

    res.status(201).json({ message: "Barang berhasil ditambahkan!", barang });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update barang: update MongoDB and sync relevant fields to RTDB
export const updateBarang = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "barang",
      });
      updateData.gambar_url = result.secure_url;
    }

    const barang = await Barang.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });

    if (db) {
      try {
        await db.ref(`/barang/${barang._id.toString()}`).update({
          stok: barang.stok || 0,
          nama: barang.nama || '',
          harga_jual: barang.harga_jual || 0
        });
      } catch (e) {
        console.warn('Failed to update RTDB:', e.message);
      }
    }

    res.json({ message: "Barang berhasil diperbarui!", barang });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Hapus barang: hapus dari MongoDB dan RTDB
export const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByIdAndDelete(req.params.id);
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });

    if (db) {
      try {
        await db.ref(`/barang/${req.params.id}`).remove();
      } catch (e) {
        console.warn('Failed to remove from RTDB:', e.message);
      }
    }

    res.json({ message: "Barang berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Decrement stock atomically in RTDB (useful when processing a sale)
export const decrementStock = async (req, res) => {
  const { id } = req.params;
  const qty = parseInt(req.body.qty || '1', 10);
  if (!id || isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid id or qty' });

  if (!db) return res.status(500).json({ message: 'RTDB not initialized' });

  const ref = db.ref(`/barang/${id}/stok`);
  try {
    const result = await ref.transaction(current => {
      if (current === null || typeof current === 'undefined') return current;
      const next = current - qty;
      return next < 0 ? 0 : next;
    });

  if (!result.committed) return res.status(409).json({ message: 'Transaction not committed or stock missing' });

  const newStock = result.snapshot.val();

    // best-effort sync to MongoDB
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Barang.findByIdAndUpdate(id, { stok: newStock });
      }
    } catch (e) {
      console.warn('Failed to sync MongoDB stock:', e.message);
    }

    // notify connected clients via Socket.IO
    try {
      io.emit('stockUpdated', { id, stok: newStock });
    } catch (e) {
      console.warn('Failed to emit socket update:', e.message);
    }

    res.json({ id, stok: newStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};