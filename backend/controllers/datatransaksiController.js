import Transaksi from "../models/datatransaksi.js";
import Barang from "../models/databarang.js"; 
import { io } from "../server.js";
import { snap, core } from "../config/midtrans.js";
import midtransClient from "midtrans-client";
import Laporan from "../models/datalaporan.js";
import { updateBarang } from "./databarangControllers.js";
import User from "../models/user.js"; // asumsi model user/masuk sebagai User
import Counter from "../models/counter.js";
import Settings from "../models/settings.js";
import BiayaOperasional from "../models/biayaoperasional.js"; // sesuaikan path
import { v4 as uuidv4 } from "uuid"; // Untuk membuat session ID unik
// import redis from "redis"; // Gunakan Redis untuk menyimpan session sementara
// import { promisify } from "util";

/**
 * Pilih kasir aktif secara round-robin.
 * Menggunakan counter di DB untuk keandalan terhadap restart & concurrent requests.
 */


// // Buat koneksi Redis
// const redisClient = redis.createClient();
// const getAsync = promisify(redisClient.get).bind(redisClient);
// const setAsync = promisify(redisClient.set).bind(redisClient);

// // Endpoint untuk membuat session ID
// export const createSession = async (req, res) => {
//   try {
//     const sessionId = uuidv4(); // Buat session ID unik
//     await setAsync(sessionId, JSON.stringify([])); // Simpan session kosong di Redis
//     res.json({ sessionId, message: "Session berhasil dibuat" });
//   } catch (err) {
//     console.error("Error createSession:", err);
//     res.status(500).json({ message: "Gagal membuat session" });
//   }
// };

// // Endpoint untuk menambahkan produk ke keranjang berdasarkan session ID
// export const addToCart = async (req, res) => {
//   try {
//     const { sessionId, produk } = req.body;

//     // Ambil data keranjang dari Redis
//     const cartData = await getAsync(sessionId);
//     let cart = cartData ? JSON.parse(cartData) : [];

//     // Tambahkan produk ke keranjang
//     cart.push(produk);

//     // Simpan kembali ke Redis
//     await setAsync(sessionId, JSON.stringify(cart));

//     res.json({ message: "Produk berhasil ditambahkan ke keranjang", cart });
//   } catch (err) {
//     console.error("Error addToCart:", err);
//     res.status(500).json({ message: "Gagal menambahkan produk ke keranjang" });
//   }
// };

// // Endpoint untuk mengambil data keranjang berdasarkan session ID
// export const getCart = async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     // Ambil data keranjang dari Redis
//     const cartData = await getAsync(sessionId);
//     const cart = cartData ? JSON.parse(cartData) : [];

//     res.json({ cart });
//   } catch (err) {
//     console.error("Error getCart:", err);
//     res.status(500).json({ message: "Gagal mengambil data keranjang" });
//   }
// };

// // Endpoint untuk menghapus produk dari keranjang berdasarkan session ID
// export const removeFromCart = async (req, res) => {
//   try {
//     const { sessionId, produkId } = req.body;

//     // Ambil data keranjang dari Redis
//     const cartData = await getAsync(sessionId);
//     let cart = cartData ? JSON.parse(cartData) : [];

//     // Hapus produk berdasarkan ID
//     cart = cart.filter((item) => item.id !== produkId);

//     // Simpan kembali ke Redis
//     await setAsync(sessionId, JSON.stringify(cart));

//     res.json({ message: "Produk berhasil dihapus dari keranjang", cart });
//   } catch (err) {
//     console.error("Error removeFromCart:", err);
//     res.status(500).json({ message: "Gagal menghapus produk dari keranjang" });
//   }
// };


async function pilihKasirRoundRobin() {
  // ambil semua kasir yang aktif
  const kasirAktif = await User.find({ role: "kasir", status: "aktif" });
  if (!kasirAktif || kasirAktif.length === 0) {
    throw new Error("Tidak ada kasir aktif saat ini");
  }

  // atomically increment counter (upsert jika belum ada)
  const counterKey = "round_robin_kasir";
  const updatedCounter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  // pilih index berdasarkan counter
  const index = (updatedCounter.value - 1) % kasirAktif.length; // -1 supaya mulai dari 0 pada first increment
  const kasirTerpilih = kasirAktif[index];

  return kasirTerpilih;
}



export const addTransaksiToLaporan = async (transaksi) => {
  try {
    const tanggal = transaksi.tanggal_transaksi
      ? new Date(transaksi.tanggal_transaksi)
      : new Date();

    // 🔹 Hitung periode bulanan
    const startBulan = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1, 0, 0, 0, 0);
    const endBulan = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0, 23, 59, 59, 999);

    // 🔹 Cari laporan bulan ini
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
    biaya_operasional_id: biayaTerbaru?._id, // 🔹 sambungkan biaya operasional
  });
}


    // 🔹 Cari hari (YYYY-MM-DD)
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

    // ✅ Hitung ulang harga_satuan, subtotal, total_harga, dan laba
    let totalHargaFix = 0;

    transaksi.barang_dibeli = transaksi.barang_dibeli.map((barang) => {
  const jumlah = barang.jumlah || 1;
  const hargaJual = barang.harga_satuan || 0; // ✅ ambil dari harga_satuan
  const hargaBeli = barang.harga_beli || 0;

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
  };
});


    // update total harga transaksi
    transaksi.total_harga = totalHargaFix;

    // 🔹 Simpan transaksi ke harian
    laporanHarian.transaksi.push({
      nomor_transaksi: transaksi.nomor_transaksi,
      total_harga: transaksi.total_harga,
      barang_dibeli: transaksi.barang_dibeli,
      tanggal_transaksi: tanggal,
    });

    laporanHarian.total_harian += transaksi.total_harga;

    // 🔹 Update rekap metode pembayaran
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

    // 🔹 Recalculate total laba
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

    console.log("✅ Transaksi berhasil disimpan");
  } catch (err) {
    console.error("Gagal menambahkan ke laporan:", err);
  }
};




// Ambil semua transaksi (sesuai role)

//ROLE

// export const getAllTransaksi = async (req, res) => {
//   try {
//     // Pastikan user sudah login
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
//     }

//     let filter = {};

//     // Filter transaksi berdasarkan role user
//     if (req.user.role === "kasir") {
//       // Kasir hanya dapat melihat transaksi miliknya
//       filter = { kasir_id: req.user.id };
//     } else if (req.user.role === "manajer") {
//       // Manajer dapat melihat semua transaksi (bisa disesuaikan jika ada cabang)
//       filter = {}; // sementara bisa lihat semua
//     } else if (req.user.role === "admin") {
//       // Admin dapat melihat semua transaksi
//       filter = {};
//     }

//     // Ambil transaksi berdasarkan filter
//     const transaksi = await Transaksi.find(filter);
//     res.json(transaksi);
//   } catch (error) {
//     console.error("Error getAllTransaksi:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


// // FIX ini harus login
export const getAllTransaksi = async (req, res) => {
  try {
    console.log("🔑 User dari JWT:", req.user); // cek isi user

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized, silakan login dulu" });
    }

    let filter = {};

    if (req.user.role === "kasir") {
      filter.kasir_id = req.user.id; // pastikan field di schema sama    
    }

    const transaksi = await Transaksi.find(filter);
    console.log("Jumlah transaksi ditemukan:", transaksi.length);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};

// FIX ini gak perlu login
export const getAllTransaksiPublic = async (req, res) => {
  try {
    console.log("User dari JWT:", req.user); // bisa aja kosong/null

    // langsung ambil semua transaksi tanpa filter dan tanpa cek user
    const transaksi = await Transaksi.find({});
    console.log("Jumlah transaksi ditemukan:", transaksi.length);

    res.json(transaksi);
  } catch (error) {
    console.error("Error getAllTransaksi:", error);
    res.status(500).json({ message: error.message });
  }
};





// const migrateTransaksiSelesai = async () => {
//   try {
//     const transaksiSelesai = await Transaksi.find({ status: "selesai" });

//     for (const trx of transaksiSelesai) {
//       // Cek dulu apakah sudah ada di laporan supaya tidak duplikat
//       const exists = await Laporan.findOne({ nomor_transaksi: trx.nomor_transaksi });
//       if (!exists) {
//         await addTransaksiToLaporan(trx);
//         // console.log(`Transaksi ${trx.nomor_transaksi} dimasukkan ke laporan`);
//       }
//     }

//     console.log("Migrasi transaksi selesai");
//   } catch (err) {
//     console.error("Error migrasi transaksi:", err);
//   }
// };

// migrateTransaksiSelesai();
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
    const settings = await Settings.findOne();
    const allowedMethods = settings ? settings.payment_methods.map((pm) => pm.method) : ["Tunai"];

    let baseMethod = metode_pembayaran;
    let channel = null;

    const match = metode_pembayaran.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      baseMethod = match[1].trim();
      channel = match[2].trim();
    }

    const selectedMethod = settings?.payment_methods.find((pm) => pm.method === baseMethod);
    if (!selectedMethod) {
      return res.status(400).json({
        message: `Metode pembayaran '${baseMethod}' tidak valid. Pilih salah satu dari: ${allowedMethods.join(", ")}`,
      });
    }

    if (channel && selectedMethod.channels.length > 0) {
      const validChannels = selectedMethod.channels.map((c) => c.name);
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          message: `Channel '${channel}' tidak valid untuk ${baseMethod}. Pilih salah satu dari: ${validChannels.join(", ")}`,
        });
      }
    }

    // 🔹 Kurangi stok barang
    for (const item of barang_dibeli) {
      const barang =
        (await Barang.findOne({ kode_barang: item.kode_barang })) ||
        (await Barang.findOne({ nama_barang: item.nama_barang }));

      if (!barang) {
        return res.status(404).json({ message: `Barang ${item.nama_barang} tidak ditemukan!` });
      }

      const jumlah = Number(item.jumlah);
      if (barang.stok < jumlah) {
        return res.status(400).json({ message: `Stok ${item.nama_barang} tidak mencukupi!` });
      }

      barang.stok -= jumlah;
      await barang.save();
    }

    // 🔹 Buat nomor transaksi unik (tanpa spasi/simbol aneh)
    // const nomorTransaksi = "APK" + "-" +  Date.now().toString() + "-" + Math.floor(1000 + Math.random() * 9000);
    // const nomorTransaksi = "TRX-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const nomorTransaksi = uuidv4();
    // 🔹 Assign kasir (manual atau round robin)
    let kasirIdToUse = req.body.kasir_id || null;
    if (!kasirIdToUse) {
      try {
        const kasirTerpilih = await pilihKasirRoundRobin();
        kasirIdToUse = kasirTerpilih._id;
      } catch (err) {
        return res.status(400).json({ message: err.message || "Tidak dapat memilih kasir otomatis" });
      }
    }

    // 🔹 Hitung subtotal per barang
    const barangFinal = barang_dibeli.map((item) => ({
      ...item,
      subtotal: item.jumlah * item.harga_satuan,
    }));

    // 🔹 Simpan transaksi awal
    const transaksi = new Transaksi({
      ...req.body,
      barang_dibeli: barangFinal,
      order_id: nomorTransaksi,
      nomor_transaksi: nomorTransaksi,
      status: baseMethod === "Tunai" ? "selesai" : "pending",
      tanggal_transaksi: new Date(),
      kasir_id: kasirIdToUse,
    });
    await transaksi.save();

    let midtransResponse = {};

    // 🔹 Logika pembayaran
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
    gross_amount: total_harga,
  },
  bank_transfer: { bank: bankCode },
};

      const vaTransaction = await core.charge(vaChargeParams);

      let noVA = null;
      let bankName = channel || null;

      if (vaTransaction.va_numbers && vaTransaction.va_numbers.length > 0) {
        noVA = vaTransaction.va_numbers[0].va_number;
        bankName = vaTransaction.va_numbers[0].bank;
      } else if (vaTransaction.permata_va_number) {
        noVA = vaTransaction.permata_va_number;
        bankName = "permata";
      } else if (vaTransaction.cimb_va_number) {
        noVA = vaTransaction.cimb_va_number;
        bankName = "cimb";
      }

      transaksi.no_va = noVA;
      transaksi.metode_pembayaran = `Virtual Account (${bankName?.toUpperCase() || "BANK"})`;
      await transaksi.save();

      midtransResponse = vaTransaction;

    } else if (baseMethod === "Tunai") {
      midtransResponse = {
        status: "success",
        message: "Pembayaran tunai dicatat",
      };

    } else if (baseMethod === "E-Wallet") {
      const qrisChargeParams = {
        payment_type: "qris",
        transaction_details: {
          order_id: nomorTransaksi,
          gross_amount: total_harga,
        },
      };

      const qrisTransaction = await core.charge(qrisChargeParams);

      transaksi.metode_pembayaran = "E-Wallet (QRIS)";
      await transaksi.save();

      midtransResponse = qrisTransaction;

    } else if (baseMethod === "Credit Card") {
      const snapParams = {
        transaction_details: {
          order_id: nomorTransaksi,
          gross_amount: total_harga,
        },
        credit_card: { secure: true },
        customer_details: { first_name: "Pelanggan" },
        enabled_payments: ["credit_card"],
      };

      const snapTransaction = await snap.createTransaction(snapParams);

      transaksi.metode_pembayaran = "Credit Card";
      await transaksi.save();

      midtransResponse = snapTransaction;

    } else {
      const snapParams = {
        transaction_details: {
          order_id: nomorTransaksi,
          gross_amount: total_harga,
        },
        customer_details: { first_name: "Pelanggan" },
      };

      midtransResponse = await snap.createTransaction(snapParams);
    }

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      transaksi,
      midtrans: midtransResponse,
    });
  } catch (error) {
    console.error("Error createTransaksi:", error.response?.data || error.message);
    res.status(400).json({
      message: "Gagal membuat transaksi",
      error: error.response?.data || error.message,
    });
  }
};

export const cancelTransaksi = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari transaksi berdasarkan ID
    const transaksi = await Transaksi.findById(id);

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    // Jika status transaksi sudah selesai, tidak bisa dibatalkan
    if (transaksi.status === "selesai") {
      return res.status(400).json({ message: "Transaksi yang sudah selesai tidak dapat dibatalkan!" });
    }

    // Update status transaksi menjadi "dibatalkan"
    transaksi.status = "dibatalkan";

    for (const item of transaksi.barang_dibeli) {
      const barang = await Barang.findById(item.kode_barang); // ✅ pakai kode_barang (ObjectId)
      if (barang) {
        barang.stok = Number(barang.stok) + Number(item.jumlah);
        await barang.save();
        console.log(
          `Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${barang.stok}`
        );
      } else {
        console.warn(
          `Barang dengan _id ${item.kode_barang} tidak ditemukan untuk rollback stok!`
        );
      }
    }

    await transaksi.save();

    // Emit event ke semua client yang terhubung
    io.emit("statusUpdated", transaksi);

    res.json({
      message: "Transaksi berhasil dibatalkan!",
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

    // ✅ Jangan overwrite metode_pembayaran kalau sudah ada
    if (!transaksi.metode_pembayaran || transaksi.metode_pembayaran === "Transfer Bank") {
      const mapping = mapMidtransToSettings(notification);
      if (mapping.channel) {
        transaksi.metode_pembayaran = `${mapping.method} (${mapping.channel})`;
      } else {
        transaksi.metode_pembayaran = mapping.method;
      }
    }

    // ✅ Simpan nomor VA kalau ada (ini boleh overwrite biar selalu update terbaru)
    if (notification.va_numbers && notification.va_numbers.length > 0) {
      transaksi.no_va = notification.va_numbers[0].va_number;
      transaksi.bank = notification.va_numbers[0].bank.toUpperCase();
    } else if (notification.permata_va_number) {
      transaksi.no_va = notification.permata_va_number;
      transaksi.bank = "PERMATA";
    }

    // ✅ Simpan detail lain (opsional)
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
    // Jika status expire, kembalikan stok barang berdasarkan _id
if (status === "expire" || status === "dibatalkan") {
  for (const item of transaksi.barang_dibeli) {
    const barang = await Barang.findById(item.kode_barang); 
    if (barang) {
      barang.stok = Number(barang.stok) + Number(item.jumlah);
      await barang.save();
      console.log(
        `Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${barang.stok}`
      );
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

// Update status transaksi
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

    // Kirim event ke semua client yang connect
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
// //FIX STATUS
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
    console.error("❌ Error getStatusTransaksi:", err);
    res.status(500).json({ message: err.message });
  }
};

// User Public

export const getStatusTransaksiPublic = async (req, res) => {
  try {
    const { order_id } = req.params;

    const transaksi = await Transaksi.findOne({ order_id });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan!" });
    }

    // Pembeli hanya boleh lihat status dasar, bukan semua detail sensitif
    res.json({
      order_id: transaksi.order_id,
      status: transaksi.status,
      metode_pembayaran: transaksi.metode_pembayaran,
      total_harga: transaksi.total_harga,
    });
  } catch (err) {
    console.error("❌ Error getStatusTransaksiPublic:", err);
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
      // Dana, OVO, LinkAja, ShopeePay biasanya lewat QRIS
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