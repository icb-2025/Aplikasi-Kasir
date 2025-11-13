import ModalUtama from "../../models/modalutama.js";

// ✅ Ambil semua data modal utama
export const getModalUtama = async (req, res) => {
  try {
    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Data modal utama belum dibuat." });
    }
    res.json(modal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Buat modal utama (pertama kali)
export const createModalUtama = async (req, res) => {
  try {
    const { total_modal } = req.body;

    const existing = await ModalUtama.findOne();
    if (existing) {
      return res
        .status(400)
        .json({ message: "Modal utama sudah ada, gunakan update saja." });
    }

    const modal = new ModalUtama({
      total_modal,
      sisa_modal: total_modal,
      bahan_baku: [],
      biaya_operasional: [],
      riwayat: [],
    });

    await modal.save();

    res.status(201).json({
      message: "Modal utama berhasil dibuat!",
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Tambah bahan baku / produk baru
export const tambahBahanBaku = async (req, res) => {
  try {
    const { nama_produk, bahan } = req.body;

    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Modal utama belum dibuat." });
    }

    // cari produk dengan nama yang sama
    let produk = modal.bahan_baku.find(p => p.nama_produk === nama_produk);

    // total baru = jumlah total harga bahan (tanpa dikali jumlah)
    let totalBaru = 0;
    if (bahan && Array.isArray(bahan)) {
      totalBaru = bahan.reduce((sum, b) => sum + (b.harga || 0), 0);
    }

    if (produk) {
      // produk udah ada → tambahkan bahan baru
      produk.bahan.push(...bahan);

      modal.riwayat.push({
        keterangan: `Tambah bahan baru ke produk: ${nama_produk}`,
        tipe: "pengeluaran",
        jumlah: totalBaru,
        saldo_setelah: modal.sisa_modal - totalBaru,
      });
    } else {
      // produk baru
      modal.bahan_baku.push({ nama_produk, bahan });

      modal.riwayat.push({
        keterangan: `Tambah produk baru: ${nama_produk}`,
        tipe: "pengeluaran",
        jumlah: totalBaru,
        saldo_setelah: modal.sisa_modal - totalBaru,
      });
    }

    modal.sisa_modal -= totalBaru;
    await modal.save();

    res.json({
      message: produk
        ? "Bahan baru berhasil ditambahkan ke produk yang sudah ada!"
        : "Produk baru berhasil ditambahkan ke modal utama!",
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Edit bahan baku (nama produk / bahan di dalamnya)
export const editBahanBaku = async (req, res) => {
  try {
    const { id_produk } = req.params;
    const { nama_produk, bahan } = req.body;

    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Modal utama belum dibuat." });
    }

    const produk = modal.bahan_baku.id(id_produk);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    // Update data
    if (nama_produk) produk.nama_produk = nama_produk;
    if (bahan && Array.isArray(bahan)) produk.bahan = bahan;

    // Hitung ulang total bahan (tanpa dikali jumlah)
    const totalProduk = produk.bahan.reduce(
      (sum, b) => sum + (b.harga || 0),
      0
    );

    modal.riwayat.push({
      keterangan: `Edit bahan pada produk: ${produk.nama_produk}`,
      tipe: "pengeluaran",
      jumlah: totalProduk,
      saldo_setelah: modal.sisa_modal - totalProduk,
    });

    await modal.save();

    res.json({
      message: "Bahan baku produk berhasil diperbarui!",
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Hapus satu produk
export const hapusBahanBaku = async (req, res) => {
  try {
    const { id_produk } = req.params;

    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Modal utama belum dibuat." });
    }

    const produk = modal.bahan_baku.id(id_produk);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    const totalProduk = produk.bahan.reduce(
      (sum, b) => sum + (b.harga || 0),
      0
    );

    produk.deleteOne();

    modal.riwayat.push({
      keterangan: `Hapus bahan baku produk: ${produk.nama_produk}`,
      tipe: "pemasukan",
      jumlah: totalProduk,
      saldo_setelah: modal.sisa_modal + totalProduk,
    });

    modal.sisa_modal += totalProduk;
    await modal.save();

    res.json({
      message: "Produk bahan baku berhasil dihapus!",
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Hapus satu bahan dari produk
export const hapusBahanDariProduk = async (req, res) => {
  try {
    const { id_produk, id_bahan } = req.params;

    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Modal utama belum dibuat." });
    }

    const produk = modal.bahan_baku.id(id_produk);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    const bahan = produk.bahan.id(id_bahan);
    if (!bahan) {
      return res.status(404).json({ message: "Bahan tidak ditemukan di produk ini." });
    }

    const totalBahan = bahan.harga || 0;

    bahan.deleteOne();

    modal.riwayat.push({
      keterangan: `Hapus bahan "${bahan.nama}" dari produk: ${produk.nama_produk}`,
      tipe: "pemasukan",
      jumlah: totalBahan,
      saldo_setelah: modal.sisa_modal + totalBahan,
    });

    modal.sisa_modal += totalBahan;
    await modal.save();

    res.json({
      message: `Bahan "${bahan.nama}" berhasil dihapus dari ${produk.nama_produk}!`,
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Tambah biaya operasional
export const tambahBiayaOperasional = async (req, res) => {
  try {
    const { nama, total } = req.body;

    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Modal utama belum dibuat." });
    }

    modal.biaya_operasional.push({ nama, total });

    modal.riwayat.push({
      keterangan: `Biaya operasional: ${nama}`,
      tipe: "pengeluaran",
      jumlah: total,
      saldo_setelah: modal.sisa_modal - total,
    });

    modal.sisa_modal -= total;
    await modal.save();

    res.json({
      message: "Biaya operasional berhasil ditambahkan!",
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Tambah modal baru (pemasukan)
export const tambahModalBaru = async (req, res) => {
  try {
    const { jumlah, keterangan } = req.body;

    const modal = await ModalUtama.findOne();
    if (!modal) {
      return res.status(404).json({ message: "Modal utama belum dibuat." });
    }

    modal.total_modal += jumlah;
    modal.sisa_modal += jumlah;

    modal.riwayat.push({
      keterangan: keterangan || "Penambahan modal baru",
      tipe: "pemasukan",
      jumlah,
      saldo_setelah: modal.sisa_modal,
    });

    await modal.save();

    res.json({
      message: "Modal baru berhasil ditambahkan!",
      modal,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
