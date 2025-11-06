import Transaksi from "./../../models/datatransaksi.js";
import Barang from "./../../models/databarang.js";
import db from "./../../config/firebaseAdmin.js";
import { io } from "./../../server.js";
import { snap, core } from "./../../config/midtrans.js";
import User from "./../../models/user.js";
import Settings from "./../../models/settings.js";
import { v4 as uuidv4 } from "uuid";
import { pilihKasirRoundRobin } from "./helpers/kasirHelper.js";
import { addTransaksiToLaporan } from "./helpers/laporanHelper.js";

export const createTransaksi = async (req, res) => {
  try {
    const { barang_dibeli, metode_pembayaran, total_harga } = req.body;
    const grossAmount = Math.round(Number(total_harga));

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
          if (current < jumlah) return;
          return current - jumlah;
        });

        if (!trx.committed) {
          return res.status(400).json({ message: `Stok ${item.nama_barang} tidak mencukupi!` });
        }

        const newStock = trx.snapshot.val();

        await Barang.findByIdAndUpdate(barang._id, { stok: newStock });

        io.emit("stockUpdated", { id: barang._id.toString(), stok: newStock });
      } else {
        if (barang.stok < jumlah) {
          return res.status(400).json({ message: `Stok ${item.nama_barang} tidak mencukupi!` });
        }
        barang.stok -= jumlah;
        await barang.save();
        io.emit("stockUpdated", { id: barang._id.toString(), stok: barang.stok });
      }
    }

    const nomorTransaksi = uuidv4();
    let kasirUsername = req.body.kasir_username;

    if (!kasirUsername) {
      const kasirTerpilih = await pilihKasirRoundRobin();
      kasirUsername = kasirTerpilih?.username || "kasir_default";
    } else {
      const kasirData = await User.findOne({ username: kasirUsername, role: "kasir" });
      if (!kasirData) {
        return res.status(400).json({ message: `Kasir '${kasirUsername}' tidak ditemukan atau bukan kasir.` });
      }
    }

    const barangFinal = await Promise.all(
      barang_dibeli.map(async (item) => {
        const barangData = await Barang.findOne({
          $or: [
            { _id: item.kode_barang },
            { kode_barang: item.kode_barang },
            { nama_barang: item.nama_barang },
          ],
        });

        return {
          ...item,
          kode_barang: barangData?.kode_barang || item.kode_barang,
          subtotal: item.jumlah * item.harga_satuan,
        };
      })
    );

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

    if (transaksi.status === "selesai") {
      await addTransaksiToLaporan(transaksi)
    }

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