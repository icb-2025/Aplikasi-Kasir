import Transaksi from "../models/datatransaksi.js";
import Barang from "../models/databarang.js"; 
import db from "../config/firebaseAdmin.js";
import { io } from "../server.js";
import { snap, core } from "../config/midtrans.js";
import midtransClient from "midtrans-client";
import Laporan from "../models/datalaporan.js";
import { updateBarang } from "./databarangControllers.js";
import User from "../models/user.js";
import Counter from "../models/counter.js";
import Settings from "../models/settings.js";
import BiayaOperasional from "../models/biayaoperasional.js";
import { v4 as uuidv4 } from "uuid";


async function pilihKasirRoundRobin() {
  // ambil semua kasir yang aktif
  const kasirAktif = await User.find({ role: "kasir", status: "aktif" });
  if (!kasirAktif || kasirAktif.length === 0) {
    throw new Error("Tidak ada kasir aktif saat ini");
  }

  const counterKey = "round_robin_kasir";
  const updatedCounter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const index = (updatedCounter.value - 1) % kasirAktif.length; 
  const kasirTerpilih = kasirAktif[index];

  return kasirTerpilih;
}



export const addTransaksiToLaporan = async (transaksi) => {
  try {
    const tanggal = transaksi.tanggal_transaksi
      ? new Date(transaksi.tanggal_transaksi)
      : new Date();

    const startBulan = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1, 0, 0, 0, 0);
    const endBulan = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0, 23, 59, 59, 999);

    let laporan = await Laporan.findOne({
      "periode.start": startBulan,
      "periode.end": endBulan,
    });

    if (!laporan) {
  const biayaTerbaru = await BiayaOperasional.findOne().sort({ createdAt: -1 });

  laporan = new Laporan({
    periode: { start: startBulan, end: endBulan },
    laporan_penjualan: { harian: [], mingguan: [], bulanan: [] },
    laba: { total_laba: 0, detail: [] },
    rekap_metode_pembayaran: [],
    biaya_operasional_id: biayaTerbaru?._id, 
  });
}


    const tanggalHarian = tanggal.toISOString().split("T")[0];
    let laporanHarian = laporan.laporan_penjualan.harian.find(
      (h) => h.tanggal === tanggalHarian
    );

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

    const produk = await Barang.findOne({ kode_barang: barang.kode_barang });
    const hargaBeli = produk ? produk.harga_beli : 0;

    const subtotal = hargaJual * jumlah;
    const labaItem = (hargaJual - hargaBeli) * jumlah;

    totalHargaFix += subtotal;

    laporan.laba.detail.push({
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
      harga_beli: hargaBeli
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

    laporan.laba.total_laba = laporan.laba.detail.reduce(
      (acc, item) => acc + (item.laba || 0),
      0
    );

    const biayaOperasional = await BiayaOperasional.findById(laporan.biaya_operasional_id);
const totalBiayaOperasional = biayaOperasional?.total || 0;

laporan.laba.total_laba = 
  laporan.laba.detail.reduce((acc, item) => acc + (item.laba || 0), 0) 
  - totalBiayaOperasional;


    await laporan.save();

    console.log("Transaksi berhasil disimpan");
  } catch (err) {
    console.error("Gagal menambahkan ke laporan:", err);
  }
};

export const getAllTransaksi = async (req, res) => {
  try {
    console.log("User dari JWT:", req.user); 

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    let filter = {};

    if (req.user.role === "kasir") {
      // kasir_id stores username (lightweight), filter by username so kasir only sees their own transaksi
      filter.kasir_id = req.user.username || req.user.id;
    }

    const transaksi = await Transaksi.find(filter).populate({
      path: "kasir_id",
      select: "nama_lengkap ProfilePicture",
    });
    console.log("Jumlah transaksi ditemukan:", transaksi.length);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllTransaksiPublic = async (req, res) => {
  try {
    console.log("User dari JWT:", req.user); 

    const transaksi = await Transaksi.find({});
    console.log("Jumlah transaksi ditemukan:", transaksi.length);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};


function formatDateForMidtrans(date = new Date()) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss} +0700`;
}


export const createTransaksi = async (req, res) => {
  try {
    const { barang_dibeli, metode_pembayaran, total_harga } = req.body;
    const grossAmount = Math.round(Number(total_harga));

    // Ambil metode pembayaran dari Settings
    const settings = await Settings.findOne();
    const allowedMethods = settings ? settings.payment_methods.map(pm => pm.method) : ["Tunai"];
    let baseMethod = metode_pembayaran;
    let channel = null;

    const match = metode_pembayaran.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      baseMethod = match[1].trim();
      channel = match[2].trim();
    }

    const selectedMethod = settings?.payment_methods.find(pm => pm.method === baseMethod);
    if (!selectedMethod) {
      return res.status(400).json({
        message: `Metode pembayaran '${baseMethod}' tidak valid. Pilih salah satu dari: ${allowedMethods.join(", ")}`,
      });
    }

    if (channel && selectedMethod.channels.length > 0) {
      const validChannels = selectedMethod.channels.map(c => c.name);
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          message: `Channel '${channel}' tidak valid untuk ${baseMethod}. Pilih salah satu dari: ${validChannels.join(", ")}`,
        });
      }
    }

    // 🔹 Update stok barang secara atomik di Firebase + Mongo
    for (const item of barang_dibeli) {
      const barang = await Barang.findOne({
        $or: [{ kode_barang: item.kode_barang }, { nama_barang: item.nama_barang }],
      });

      if (!barang) {
        return res.status(404).json({ message: `Barang ${item.nama_barang} tidak ditemukan!` });
      }

      const jumlah = Number(item.jumlah);

      if (db) {
        const ref = db.ref(`/barang/${barang._id.toString()}/stok`);
        const trx = await ref.transaction(current => {
          if (current === null || typeof current === "undefined") return 0;
          if (current < jumlah) return; // batalkan jika stok kurang
          return current - jumlah;
        });

        if (!trx.committed) {
          return res.status(400).json({ message: `Stok ${item.nama_barang} tidak mencukupi!` });
        }

        const newStock = trx.snapshot.val();

        // Sync ke MongoDB
        await Barang.findByIdAndUpdate(barang._id, { stok: newStock });

        // Emit ke semua frontend yang terkoneksi
        io.emit("stockUpdated", { id: barang._id.toString(), stok: newStock });
      } else {
        // fallback MongoDB jika RTDB error
        if (barang.stok < jumlah) {
          return res.status(400).json({ message: `Stok ${item.nama_barang} tidak mencukupi!` });
        }
        barang.stok -= jumlah;
        await barang.save();
        io.emit("stockUpdated", { id: barang._id.toString(), stok: barang.stok });
      }
    }

    // 🔹 Buat transaksi
    const nomorTransaksi = uuidv4();
    // 🔹 Ambil kasir
let kasirUsername = req.body.kasir_username;

if (!kasirUsername) {
  const kasirTerpilih = await pilihKasirRoundRobin();
  kasirUsername = kasirTerpilih?.username || "kasir_default";
} else {
  // validasi bahwa username itu memang kasir
  const kasirData = await User.findOne({ username: kasirUsername, role: "kasir" });
  if (!kasirData) {
    return res.status(400).json({ message: `Kasir '${kasirUsername}' tidak ditemukan atau bukan kasir.` });
  }
}


    const barangFinal = barang_dibeli.map(item => ({
      ...item,
      subtotal: item.jumlah * item.harga_satuan,
    }));

    const transaksi = new Transaksi({
      ...req.body,
      barang_dibeli: barangFinal,
      order_id: nomorTransaksi,
      nomor_transaksi: nomorTransaksi,
      status: baseMethod === "Tunai" ? "selesai" : "pending",
      tanggal_transaksi: new Date(),
      kasir_id: kasirUsername,
      user_id: req.user?.id || null,
    });

    await transaksi.save();

    // 🔹 Midtrans handling
    let midtransResponse = {};
    if (baseMethod === "Virtual Account") {
      const bankMapping = {
        bca: "bca",
        bni: "bni",
        bri: "bri",
        permata: "permata",
        "cimb niaga": "cimb",
      };
      const bankCode = bankMapping[channel?.toLowerCase()] || "permata";

      const vaChargeParams = {
        payment_type: "bank_transfer",
        transaction_details: {
          order_id: nomorTransaksi,
          gross_amount: grossAmount,
        },
        bank_transfer: { bank: bankCode },
      };

      const vaTransaction = await core.charge(vaChargeParams);
      transaksi.no_va = vaTransaction.va_numbers?.[0]?.va_number || null;
      transaksi.metode_pembayaran = `Virtual Account (${bankCode.toUpperCase()})`;
      await transaksi.save();
      midtransResponse = vaTransaction;

    } else if (baseMethod === "E-Wallet") {
      const qrisTransaction = await core.charge({
        payment_type: "qris",
        transaction_details: { order_id: nomorTransaksi, gross_amount: grossAmount },
      });
      transaksi.metode_pembayaran = "E-Wallet (QRIS)";
      await transaksi.save();
      midtransResponse = qrisTransaction;

    } else if (baseMethod === "Credit Card") {
      const snapTransaction = await snap.createTransaction({
        transaction_details: { order_id: nomorTransaksi, gross_amount: grossAmount },
        credit_card: { secure: true },
      });
      transaksi.metode_pembayaran = "Credit Card";
      await transaksi.save();
      midtransResponse = snapTransaction;

    } else if (baseMethod === "Tunai") {
      midtransResponse = { status: "success", message: "Pembayaran tunai dicatat" };
    }

    return res.status(201).json({
      message: "Transaksi berhasil dibuat",
      transaksi,
      midtrans: midtransResponse,
    });
  } catch (error) {
    console.error("Error createTransaksi:", error);
    return res.status(400).json({ message: "Gagal membuat transaksi", error: error.message });
  }
};

export const cancelTransaksi = async (req, res) => {
  try {
    const { id } = req.params;

    const transaksi = await Transaksi.findById(id);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    if (transaksi.status === "selesai") {
      return res.status(400).json({ message: "Transaksi yang sudah selesai tidak dapat dibatalkan!" });
    }

    if (transaksi.stok_dikembalikan) {
      return res.status(400).json({ message: "Stok sudah dikembalikan untuk transaksi ini!" });
    }

    transaksi.status = "dibatalkan";

    for (const item of transaksi.barang_dibeli) {
      const barang = await Barang.findById(item.kode_barang);
      if (barang) {
        const jumlah = Number(item.jumlah);
        if (db) {
          try {
            const ref = db.ref(`/barang/${barang._id.toString()}/stok`);
      const trx = await ref.transaction(c => {
  if (c === null || typeof c === "undefined") return jumlah; // kalau stok belum ada, isi jumlah awal
  return c + jumlah; // tambahkan stok kembali
});

            if (trx.committed) {
              const newStock = trx.snapshot.val();
              // sync to Mongo
              try { await Barang.findByIdAndUpdate(barang._id, { stok: newStock }); } catch (e) { console.warn('Sync Mongo failed:', e.message); }
              console.log(`(Cancel) Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${newStock}`);
              try { io.emit('stockUpdated', { id: barang._id.toString(), stok: newStock }); } catch (e) { console.warn('Emit failed:', e.message); }
              continue;
            }
          } catch (e) {
            console.warn('RTDB increment failed, falling back to Mongo:', e.message);
          }
        }
console.log(`(Cancel) Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${newStock}`);
        // fallback to Mongo
        barang.stok = Number(barang.stok) + Number(item.jumlah);
        await barang.save();
        console.log(
          `(Cancel) Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${barang.stok}`
        );
        try { io.emit('stockUpdated', { id: barang._id.toString(), stok: barang.stok }); } catch (e) { console.warn('Emit failed:', e.message); }
      } else {
        console.warn(
          `Barang dengan _id ${item.kode_barang} tidak ditemukan untuk rollback stok!`
        );
      }
    }

    transaksi.stok_dikembalikan = true;
    await transaksi.save();

    io.emit("statusUpdated", transaksi);

    res.json({
      message: "Transaksi berhasil dibatalkan dan stok dikembalikan!",
      transaksi,
    });
  } catch (err) {
    console.error("Error cancelTransaksi:", err);
    res.status(500).json({ message: err.message });
  }
};

export const midtransCallback = async (req, res) => {
  console.log("Callback diterima:", req.body);

  try {
    const notification = req.body;

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    let status = "pending";
    if (transactionStatus === "capture") {
      status = fraudStatus === "accept" ? "selesai" : "pending";
    } else if (transactionStatus === "settlement") {
      status = "selesai";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny") {
      status = "dibatalkan";
    } else if (transactionStatus === "expire") {
      status = "expire";
    } else if (transactionStatus === "pending") {
      status = "pending";
    }
    const transaksi = await Transaksi.findOne({ order_id: notification.order_id });
    if (!transaksi) {
      console.warn(`Transaksi dengan order_id ${orderId} tidak ditemukan, simpan ke log untuk cek ulang!`);
      return res.json({ message: "Callback diterima, transaksi belum ada" });
    }

    console.log("Order ID dari Midtrans:", notification.order_id);
    console.log("Transaksi ditemukan:", transaksi);

    transaksi.status = status;

    if (!transaksi.metode_pembayaran || transaksi.metode_pembayaran === "Transfer Bank") {
      const mapping = mapMidtransToSettings(notification);
      if (mapping.channel) {
        transaksi.metode_pembayaran = `${mapping.method} (${mapping.channel})`;
      } else {
        transaksi.metode_pembayaran = mapping.method;
      }
    }

    if (notification.va_numbers && notification.va_numbers.length > 0) {
      transaksi.no_va = notification.va_numbers[0].va_number;
      transaksi.bank = notification.va_numbers[0].bank.toUpperCase();
    } else if (notification.permata_va_number) {
      transaksi.no_va = notification.permata_va_number;
      transaksi.bank = "PERMATA";
    }

    if (notification.payment_type === "credit_card") {
      transaksi.card_type = notification.card_type;
      transaksi.masked_card = notification.masked_card;
      transaksi.bank = notification.bank;
    }

    await transaksi.save();
    console.log(
      `Status transaksi ${orderId} diupdate menjadi '${status}' dengan metode '${transaksi.metode_pembayaran}'`
    );

    if (status === "selesai") {
      await addTransaksiToLaporan(transaksi);
    }
if (status === "expire" || status === "dibatalkan") {
  for (const item of transaksi.barang_dibeli) {
    const barang = await Barang.findById(item.kode_barang);
    if (barang) {
      const jumlah = Number(item.jumlah);
      if (db) {
        try {
          const ref = db.ref(`/barang/${barang._id.toString()}/stok`);
    const trx = await ref.transaction(c => {
  if (c === null || typeof c === "undefined") return jumlah;
  return c + jumlah; // ✅ tambahkan stok
});


          if (trx.committed) {
            const newStock = trx.snapshot.val();
            try { await Barang.findByIdAndUpdate(barang._id, { stok: newStock }); } catch (e) { console.warn('Sync Mongo failed:', e.message); }
            console.log(`Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${newStock}`);
            try { io.emit('stockUpdated', { id: barang._id.toString(), stok: newStock }); } catch (e) { console.warn('Emit failed:', e.message); }
            continue;
          }
        } catch (e) {
          console.warn('RTDB increment failed, falling back to Mongo:', e.message);
        }
      }

      barang.stok = Number(barang.stok) + Number(item.jumlah);
      await barang.save();
      console.log(
        `Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${barang.stok}`
      );
      try { io.emit('stockUpdated', { id: barang._id.toString(), stok: barang.stok }); } catch (e) { console.warn('Emit failed:', e.message); }
    } else {
      console.warn(
        `Barang dengan _id ${item.kode_barang} tidak ditemukan untuk rollback stok!`
      );
    }
  }
}


    res.json({ message: "Notifikasi Midtrans diproses", status });
  } catch (err) {
    console.error("Error midtransCallback:", err);
    res.status(500).json({ message: err.message });
  }
};

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

export const updateStatusTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaksi = await Transaksi.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    io.emit("statusUpdated", transaksi);

    if (status === "selesai") {
  await addTransaksiToLaporan(transaksi);
}

    res.json({
      message: `Status transaksi berhasil diubah menjadi '${status}'`,
      transaksi
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getStatusTransaksi = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    let filter = { order_id };

    if (req.user.role === "kasir") {
      filter.kasir_id = req.user.id;
    }

    console.log("Filter query:", filter);

    const transaksi = await Transaksi.findOne(filter);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    res.json({
      order_id: transaksi.order_id,
      status: transaksi.status,
      metode_pembayaran: transaksi.metode_pembayaran,
      total_harga: transaksi.total_harga,
      no_va: transaksi.no_va || null,
    });
  } catch (err) {
    console.error("Error getStatusTransaksi:", err);
    res.status(500).json({ message: err.message });
  }
};


// Cek status transaksi publik (untuk pembeli, tidak login)
export const getStatusTransaksiPublic = async (req, res) => {
  try {
    const { order_id } = req.params;

    const transaksi = await Transaksi.findOne({ order_id });
    if (!transaksi) {
      return res.status(404).json({ message: `Transaksi dengan nomor ${order_id} tidak ditemukan` });
    }

    res.status(200).json({
      order_id: transaksi.order_id,
      status: transaksi.status,
      metode_pembayaran: transaksi.metode_pembayaran,
      tanggal_transaksi: transaksi.tanggal_transaksi,
      total_harga: transaksi.total_harga,
      barang_dibeli: transaksi.barang_dibeli.map(item => ({
        nama_barang: item.nama_barang,
        jumlah: item.jumlah,
        subtotal: item.subtotal
      })),
    });
  } catch (error) {
    console.error("Error getStatusTransaksiPublic:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengecek status transaksi", error: error.message });
  }
};


export const getUserHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    // Ambil transaksi berdasarkan user yang login
    const transaksi = await Transaksi.find({ user_id: req.user.id })
      .sort({ createdAt: -1 }); // urutkan dari terbaru

    if (!transaksi || transaksi.length === 0) {
      return res.status(404).json({ message: "Belum ada riwayat transaksi" });
    }

    res.json({
      message: "Riwayat transaksi berhasil diambil",
      riwayat: transaksi.map(trx => ({
        order_id: trx.order_id,
        nama_barang: trx.barang_dibeli, 
        status: trx.status,
        metode_pembayaran: trx.metode_pembayaran,
        total_harga: trx.total_harga,
        kasir_id: trx.kasir_id,
        createdAt: trx.createdAt,
      }))
    });
  } catch (err) {
    console.error("Error getUserHistory:", err);
    res.status(500).json({ message: err.message });
  }
};

function mapMidtransToSettings(notification) {
  // Case: VA
  if (notification.va_numbers && notification.va_numbers.length > 0) {
    const bank = notification.va_numbers[0].bank.toUpperCase();
    return { method: "Virtual Account", channel: bank };
  }

  switch (notification.payment_type) {
    case "credit_card":
      return { method: "Kartu Kredit", channel: notification.card_type || "Visa/MasterCard" };

    case "bank_transfer":
      return { method: "Transfer Bank", channel: (notification.bank || "").toUpperCase() };

    case "echannel":
      return { method: "Virtual Account", channel: "Mandiri" };

    case "gopay":
      return { method: "E-Wallet", channel: "Gopay" };

    case "shopeepay":
      return { method: "E-Wallet", channel: "ShopeePay" };

    case "qris":
      const acquirer = (notification.acquirer || "").toLowerCase();
      if (acquirer.includes("dana")) return { method: "E-Wallet", channel: "Dana" };
      if (acquirer.includes("ovo")) return { method: "E-Wallet", channel: "Ovo" };
      if (acquirer.includes("linkaja")) return { method: "E-Wallet", channel: "LinkAja" };
      if (acquirer.includes("shopeepay")) return { method: "E-Wallet", channel: "ShopeePay" };
      return { method: "QRIS", channel: null };

    case "cstore":
      return { method: "Tunai", channel: notification.store || "Alfamart/Indomaret" };

    default:
      return { method: notification.payment_type, channel: null };
  }
}
