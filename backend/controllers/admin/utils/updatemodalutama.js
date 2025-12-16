import ModalUtama from "../../../models/modalutama.js";

/**
 * Kurangi sisa modal utama sesuai jumlah pengeluaran
 * @param {number} jumlah - jumlah pengeluaran
 * @param {string} keterangan - keterangan transaksi
 */
export const kurangiModalUtama = async (jumlah, keterangan) => {
  if (!jumlah || jumlah <= 0) return null;

  const modal = await ModalUtama.findOne();
  if (!modal) {
    console.warn("⚠️ Modal utama belum dibuat, pengurangan dilewati.");
    return null;
  }

  // Cek apakah sisa modal cukup
  if (modal.sisa_modal < jumlah) {
    throw new Error(`Modal tidak cukup. Sisa modal: ${modal.sisa_modal}, dibutuhkan: ${jumlah}.`);
  }

  modal.sisa_modal -= jumlah;
  modal.riwayat.push({
    keterangan,
    tipe: "pengeluaran",
    jumlah,
    saldo_setelah: modal.sisa_modal,
  });

  await modal.save();
  return modal;
};

/**
 * Tambah modal utama (misalnya pemasukan)
 */
export const tambahModalUtama = async (jumlah, keterangan = "Pemasukan baru") => {
  if (!jumlah || jumlah <= 0) return null;

  const modal = await ModalUtama.findOne();
  if (!modal) {
    console.warn("⚠️ Modal utama belum dibuat, penambahan dilewati.");
    return null;
  }

  modal.total_modal += jumlah;
  modal.sisa_modal += jumlah;
  modal.riwayat.push({
    keterangan,
    tipe: "pemasukan",
    jumlah,
    saldo_setelah: modal.sisa_modal,
  });

  await modal.save();
  return modal;
};
