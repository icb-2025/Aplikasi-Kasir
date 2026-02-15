import connectDB from "../database/db.js";
import BahanBaku from "../models/bahanbaku.js";

const run = async () => {
  await connectDB();

  const semua = await BahanBaku.find();
  console.log(`Found ${semua.length} bahanbaku documents`);

  for (const doc of semua) {
    const bahan = Array.isArray(doc.bahan) ? doc.bahan : [];

    const total_stok = bahan.reduce((s, it) => s + Number(it.jumlah || 0), 0);
    const total_harga_bahan = bahan.reduce((s, it) => s + (Number(it.harga || 0) * Number(it.jumlah || 0)), 0);
    const modal_per_porsi = total_stok > 0 ? Math.ceil(total_harga_bahan / total_stok) : 0;

    doc.total_stok = total_stok;
    doc.total_harga_bahan = total_harga_bahan;
    doc.modal_per_porsi = modal_per_porsi;

    await doc.save();
    console.log(`Updated ${doc._id}: total_harga_bahan=${total_harga_bahan}, total_stok=${total_stok}`);
  }

  console.log("Recalculation finished.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
