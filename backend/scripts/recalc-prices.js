#!/usr/bin/env node
/*
  scripts/recalc-prices.js
  Rekalkulasi semua hargaFinal untuk koleksi Data-Barang berdasarkan Settings.

  Usage:
    node backend/scripts/recalc-prices.js [--uri mongodb://...] 

  If --uri is not provided, script uses process.env.MONGODB_URI.
*/

import mongoose from "mongoose";
import Settings from "../models/settings.js";
import Barang from "../models/databarang.js";

const argv = process.argv.slice(2);
let MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Aplikasi-Kasir:583MfRNgmRj20lCY@cluster0.cg0gf.mongodb.net/Aplikasi-Kasir?retryWrites=true&w=majority&appName=Cluster0";
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--uri" && argv[i + 1]) {
    MONGODB_URI = argv[i + 1];
  }
}

async function main() {
  console.log("Connecting to", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const settings = (await Settings.findOne()) || {};
  const taxRate = settings.taxRate || 0;
  const globalDiscount = settings.globalDiscount || 0;
  const serviceCharge = settings.serviceCharge || 0;

  console.log({ taxRate, globalDiscount, serviceCharge });

  const barangList = await Barang.find();
  if (!barangList.length) {
    console.log("Tidak ada barang ditemukan.");
    process.exit(0);
  }

  const bulkOps = [];
  for (const b of barangList) {
    const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * globalDiscount) / 100;
    const hargaSetelahPajak = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
    const hargaFinal = hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;
    const hargaFinalRounded = Number(hargaFinal.toFixed(2));

    bulkOps.push({
      updateOne: {
        filter: { _id: b._id },
        update: { $set: { hargaFinal: hargaFinalRounded } },
      },
    });
  }

  if (bulkOps.length) {
    const result = await Barang.bulkWrite(bulkOps);
    console.log("bulkWrite result:", result);
  }

  console.log(`Rekalkulasi selesai untuk ${bulkOps.length} barang.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
