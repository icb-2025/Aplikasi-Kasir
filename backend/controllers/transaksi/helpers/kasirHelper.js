// backend/controllers/transaksi/helpers/kasirHelper.js

import User from "../../../models/user.js";
import Counter from "../../../models/counter.js";

export const pilihKasirRoundRobin = async () => {
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
};