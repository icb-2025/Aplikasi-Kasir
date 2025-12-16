import db from "../../config/firebaseAdmin.js";
import { io } from "../../server.js";
import BiayaOperasional from "../../models/biayaoperasional.js";
import Barang from "../../models/databarang.js";
import Settings from "../../models/settings.js";
import { kurangiModalUtama } from "./utils/updatemodalutama.js";


// Tambah atau edit biaya operasional (hanya satu dokumen)
export const addOrUpdateBiaya = async (req, res) => {
  try {
    // Sekarang kita hanya menerima satu array: rincian_biaya
    const { rincian_biaya } = req.body;

    // Validasi dasar: pastikan yang dikirim adalah array
    if (!Array.isArray(rincian_biaya)) {
      return res.status(400).json({ message: "Data rincian_biaya harus berupa array" });
    }

    // cek apakah sudah ada data
    let biaya = await BiayaOperasional.findOne();

    if (biaya) {
  // Hitung total lama sebelum update
  const totalLama = biaya.rincian_biaya.reduce((acc, b) => acc + (Number(b.jumlah) || 0), 0);

  // Loop melalui setiap item baru yang dikirim
  for (const newItem of rincian_biaya) {
    // Cari apakah item dengan nama yang sama sudah ada di array
    const existingItemIndex = biaya.rincian_biaya.findIndex(
      (item) => item.nama === newItem.nama
    );

    if (existingItemIndex !== -1) {
      // Jika sudah ada, update jumlahnya
      console.log(`Mengupdate item: ${newItem.nama}`);
      biaya.rincian_biaya[existingItemIndex].jumlah = newItem.jumlah;
    } else {
      // Jika belum ada, tambahkan item baru
      console.log(`Menambahkan item baru: ${newItem.nama}`);
      biaya.rincian_biaya.push(newItem);
    }
  }

  await biaya.save();
  // Hitung total baru dari semua rincian biaya
  const totalBaru = biaya.rincian_biaya.reduce((acc, b) => acc + (Number(b.jumlah) || 0), 0);

  // Hitung selisih
  const selisih = totalBaru - totalLama;

  // Jika ada pengeluaran tambahan, kurangi modal
  if (selisih > 0) {
    try {
      await kurangiModalUtama(selisih, "Pembayaran biaya operasional bulanan");
    } catch (modalError) {
      return res.status(400).json({ message: modalError.message });
    }
  }

  await updateAllBarangHargaFinal();
  res.json({ message: "Biaya operasional berhasil diperbarui!", data: biaya });
} else {
      // kalau belum ada, buat baru dengan array rincian_biaya
      const newBiaya = new BiayaOperasional({
        rincian_biaya: rincian_biaya,
      });
      await newBiaya.save();

      // Hitung total biaya dan kurangi modal untuk pertama kali
      const totalBaru = rincian_biaya.reduce((acc, b) => acc + (Number(b.jumlah) || 0), 0);
      if (totalBaru > 0) {
        try {
          await kurangiModalUtama(totalBaru, "Pembayaran biaya operasional bulanan");
        } catch (modalError) {
          // Jika modal tidak cukup, hapus biaya yang sudah dibuat
          await BiayaOperasional.findByIdAndDelete(newBiaya._id);
          return res.status(400).json({ message: modalError.message });
        }
      }

      await updateAllBarangHargaFinal();
      res.json({ message: "Biaya operasional pertama berhasil dibuat!", data: newBiaya });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan biaya operasional", error: err.message });
  }
}

// Fungsi untuk update hargaFinal semua barang
export const updateAllBarangHargaFinal = async () => {
  const settings = (await Settings.findOne()) || (await Settings.create({}));
  const taxRate = settings?.taxRate ?? 0;
  const globalDiscount = settings?.globalDiscount ?? 0;
  const previousCalculated = settings?.calculatedServiceCharge ?? 0;
  const previousServiceCharge = settings?.serviceCharge ?? null;

  // Ambil biaya operasional terbaru
  const biayaOp = await BiayaOperasional.findOne();
  const totalBiayaOperasional = biayaOp?.total || 0;

  // Hitung total nilai barang
  const allBarang = await Barang.find();
  const totalNilaiBarang = allBarang.reduce((sum, b) => sum + (Number(b.harga_jual) || 0), 0);
  
    // Hitung service charge dari biaya operasional
    let calculatedServiceCharge = 0;
    if (totalNilaiBarang > 0) {
      const estimasiPenjualanBulanan = totalNilaiBarang * 30; 
      
      // Biaya operasional dibagi estimasi penjualan bulanan
      calculatedServiceCharge = (totalBiayaOperasional / estimasiPenjualanBulanan) * 100;
      
      const MAX_SERVICE_CHARGE = 100;
      calculatedServiceCharge = Math.min(
        Math.round(calculatedServiceCharge * 100) / 100, 
        MAX_SERVICE_CHARGE
      );
    }

    // Update settings dengan service charge yang sudah dibatasi
    settings.calculatedServiceCharge = calculatedServiceCharge;
    settings.serviceCharge = calculatedServiceCharge;
    await settings.save();
    
    // Push settings ke Firebase Realtime Database agar frontend dapat ter-update secara real-time
    try {
      if (db) {
        // serialisasi document ke plain object untuk disimpan di RTDB
        const plainSettings = {
          calculatedServiceCharge: settings.calculatedServiceCharge,
          serviceCharge: settings.serviceCharge,
          taxRate: settings.taxRate || 0,
          globalDiscount: settings.globalDiscount || 0,
          receiptHeader: settings.receiptHeader || null,
          receiptFooter: settings.receiptFooter || null,
          showBarcode: settings.showBarcode || false,
          showCashierName: settings.showCashierName || false,
          storeName: settings.storeName || null,
          storeLogo: settings.storeLogo || null,
          storeAddress: settings.storeAddress || null,
          storePhone: settings.storePhone || null,
        };

        await db.ref(`/settings`).set(plainSettings);

        // Emit event via socket so connected websocket clients also get notified
        try {
          io.emit("settings:updated", plainSettings);
        } catch (e) {
          console.warn("Gagal emit settings:updated via socket:", e.message);
        }
      }
    } catch (e) {
      console.warn("⚠️ Gagal push settings ke Firebase RTDB:", e.message);
    }

  console.log('Perhitungan Service Charge:');
  console.log('Total Biaya Operasional (per bulan):', totalBiayaOperasional);
  console.log('Total Nilai Barang (per hari):', totalNilaiBarang);
  console.log('Estimasi Penjualan Bulanan:', totalNilaiBarang * 30);
  console.log('Service Charge (max 25%):', `${calculatedServiceCharge}%`);

  // Log informasi untuk debugging
  console.log('Updating all barang with new values:');
  console.log('Tax Rate:', taxRate);
  console.log('Global Discount:', globalDiscount);
  console.log('Calculated Service Charge:', `${calculatedServiceCharge}%`);
  console.log('Total Biaya Operasional:', totalBiayaOperasional);
  console.log('Total Nilai Barang:', totalNilaiBarang);

  // gunakan nilai serviceCharge aktif dari settings (agar konsisten dengan UI yang membaca settings.serviceCharge)
  const activeServiceCharge = settings.serviceCharge || 0;

  let totalUpdated = 0;
  for (const barang of allBarang) {
    const hargaJual = Number(barang.harga_jual) || 0;

    // Terapkan semua persentase secara berurutan
    // Urutan: Diskon -> Pajak -> Service Charge (dari biaya operasional atau manual override)
    const hargaSetelahDiskon = hargaJual - (hargaJual * globalDiscount) / 100;
    const hargaSetelahPajak = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
    const hargaFinal = hargaSetelahPajak + (hargaSetelahPajak * activeServiceCharge) / 100;

    barang.hargaFinal = Math.round(hargaFinal);
    
    // Log untuk debugging
    console.log(`Update harga untuk ${barang.nama_barang}:`, {
      hargaJual,
      hargaSetelahDiskon,
      hargaSetelahPajak,
      serviceCharge: `${calculatedServiceCharge}%`,
      hargaFinal
    });

    // Update ke Firebase jika tersedia
    if (db) {
      try {
        const id = barang._id.toString();
        await db.ref(`/barang/${id}`).update({
          harga_final: Math.round(hargaFinal)
        });
      } catch (e) {
        console.warn(`⚠️ Gagal update harga di Firebase untuk barang ${barang._id}:`, e.message);
      }
    }

    // Emit event untuk websocket clients
    io.emit("barang:updated", barang);

    await barang.save();
    totalUpdated++;
  }
  console.log(`✅ Berhasil update ${totalUpdated} barang`);
};

 
// Ambil data biaya (selalu 1 dokumen)
export const getBiaya = async (req, res) => {
  try {
    const data = await BiayaOperasional.findOne(); 
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};

export const deleteRincianBiayaById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari URL parameter

    if (!id) {
      return res.status(400).json({ message: "ID item biaya tidak diberikan" });
    }

    // Cari dokumen biaya operasional
    const biaya = await BiayaOperasional.findOne();

    if (!biaya) {
      return res.status(404).json({ message: "Data biaya operasional tidak ditemukan" });
    }

    // Gunakan metode `pull` untuk menghapus item dari array berdasarkan _id
    // `id` di sini adalah _id dari subdocument di dalam array rincian_biaya
    biaya.rincian_biaya.pull({ _id: id });

    await biaya.save();
    await updateAllBarangHargaFinal();

    res.json({ message: "Item biaya berhasil dihapus!", data: biaya });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus item biaya", error: err.message });
  }
};