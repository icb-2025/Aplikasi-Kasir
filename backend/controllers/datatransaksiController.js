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

/**
 * Pilih kasir aktif secara round-robin.
 * Menggunakan counter di DB untuk keandalan terhadap restart & concurrent requests.
 */


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
//     let filter = {};

//     if (req.user.role === "kasir") {
//       // hanya lihat transaksi miliknya
//       filter = { kasir_id: req.user._id }; 
//     } else if (req.user.role === "manajer") {
//       // kalau ada sistem cabang, misalnya simpan di req.user.cabang
//       // filter = { cabang: req.user.cabang };
//       filter = {}; // sementara bisa lihat semua, tapi bukan level admin penuh
//     } else if (req.user.role === "admin") {
//       // bisa lihat semua transaksi
//       filter = {};
//     }

//     const transaksi = await Transaksi.find(filter);
//     res.json(transaksi);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//Bisa diakses semua termasuk belum login
export const getAllTransaksi = async (req, res) => {
  try {
    // Semua orang bisa lihat semua transaksi
    const transaksi = await Transaksi.find();
    res.json(transaksi);
  } catch (error) {
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
    const { barang_dibeli, metode_pembayaran, total_harga, payment_channel } = req.body;

    // 🔹 Validasi metode pembayaran
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

      barang.stok = Number(barang.stok) - jumlah;
      await barang.save();
    }

    // 🔹 Buat nomor transaksi
    const nomorTransaksi = "TRX" + Date.now();

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

    // 🔹 Simpan transaksi dulu (status pending)
    const transaksi = new Transaksi({
      ...req.body,
      order_id: nomorTransaksi,
      nomor_transaksi: nomorTransaksi,
      status: baseMethod === "Tunai" ? "success" : "pending",
      tanggal_transaksi: new Date(),
      kasir_id: kasirIdToUse,
    });
    await transaksi.save();

    let midtransResponse = {};

// 🔹 Logika per metode pembayaran
if (baseMethod === "Virtual Account") {
  // VA → Core API
  const bankMapping = {
    "bca": "bca",
    "bni": "bni",
    "bri": "bri",
    "permata": "permata",
    "cimb niaga": "cimb",
  };

  const bankCode = bankMapping[channel?.toLowerCase()] || "permata"; // fallback ke permata

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

  midtransResponse = {
    transaction_id: vaTransaction.transaction_id,
    order_id: vaTransaction.order_id,
    gross_amount: vaTransaction.gross_amount,
    payment_type: vaTransaction.payment_type,
    transaction_status: vaTransaction.transaction_status,
    va_numbers: vaTransaction.va_numbers,
    permata_va_number: vaTransaction.permata_va_number,
    cimb_va_number: vaTransaction.cimb_va_number,
  };

} else if (baseMethod === "Tunai") {
  // Tunai → tanpa Midtrans
  midtransResponse = {
    status: "success",
    message: "Pembayaran tunai dicatat",
  };

} else if (baseMethod === "E-Wallet") {
  // 🔹 E-Wallet pakai QRIS Core API
  const qrisChargeParams = {
    payment_type: "qris",
    transaction_details: {
      order_id: nomorTransaksi,
      gross_amount: total_harga,
    }
  };

  const qrisTransaction = await core.charge(qrisChargeParams);

  midtransResponse = {
    transaction_id: qrisTransaction.transaction_id,
    order_id: qrisTransaction.order_id,
    gross_amount: qrisTransaction.gross_amount,
    payment_type: qrisTransaction.payment_type,
    transaction_status: qrisTransaction.transaction_status,
    qr_string: qrisTransaction.qr_string,
    actions: qrisTransaction.actions
  };

  transaksi.metode_pembayaran = "E-Wallet (QRIS)";
  await transaksi.save();

} else if (baseMethod === "Credit Card") {
  // 🔹 Credit Card → Snap (token + redirect_url untuk 3DS)
  const snapParams = {
    transaction_details: {
      order_id: nomorTransaksi,
      gross_amount: total_harga,
    },
    credit_card: {
      secure: true, // aktifkan 3DS Secure
    },
    customer_details: { first_name: "Pelanggan" },
    enabled_payments: ["credit_card"], // hanya CC yang aktif
  };

  const snapTransaction = await snap.createTransaction(snapParams);

  midtransResponse = {
    token: snapTransaction.token,
    redirect_url: snapTransaction.redirect_url,
  };

  transaksi.metode_pembayaran = "Credit Card";
  await transaksi.save();

} else {
  // 🔹 Default selain VA, Tunai, E-Wallet, Credit Card → Snap juga
  const snapParams = {
    transaction_details: {
      order_id: nomorTransaksi,
      gross_amount: total_harga,
    },
    customer_details: { first_name: "Pelanggan" },
  };

  const snapTransaction = await snap.createTransaction(snapParams);

  midtransResponse = {
    token: snapTransaction.token,
    redirect_url: snapTransaction.redirect_url,
  };
}
    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      transaksi,
      midtrans: midtransResponse,
    });

  } catch (error) {
    console.error("Error createTransaksi:", error);
    res.status(400).json({ message: error.message });
  }
};


export const midtransCallback = async (req, res) => {
  console.log("Callback diterima:", req.body);

  try {
    const notification = req.body;

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Tentukan status baru
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

    // Cari transaksi dulu
    const transaksi = await Transaksi.findOne({ order_id: notification.order_id });
    if (!transaksi) {
  console.warn(`Transaksi dengan order_id ${orderId} tidak ditemukan, simpan ke log untuk cek ulang!`);
  return res.json({ message: "Callback diterima, transaksi belum ada" });
}


    console.log("Order ID dari Midtrans:", notification.order_id);
console.log("Transaksi ditemukan:", transaksi);

// Update status transaksi
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

    // Jika status expire, kembalikan stok barang
    if (status === "expire") {
      for (const item of transaksi.barang_dibeli) {
        const barang = await Barang.findOne({ kode_barang: item.kode_barang });
        if (barang) {
          barang.stok = Number(barang.stok) + Number(item.jumlah);
          await barang.save();
          console.log(
            `Stok ${barang.nama_barang} dikembalikan sebanyak ${item.jumlah}, total sekarang: ${barang.stok}`
          );
        } else {
          console.warn(
            `Barang dengan kode ${item.kode_barang} tidak ditemukan untuk rollback stok!`
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

export const getStatusTransaksi = async (req, res) => {
  try {
    const { order_id } = req.params;

    const transaksi = await Transaksi.findOne({ order_id });

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
    res.status(500).json({ message: err.message });
  }
};


function mapMidtransToSettings(notification) {
  // Case: VA
  if (notification.va_numbers && notification.va_numbers.length > 0) {
    const bank = notification.va_numbers[0].bank.toUpperCase();
    return { method: "Virtual Account", channel: bank };
  }

  // Case: berdasarkan payment_type
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

