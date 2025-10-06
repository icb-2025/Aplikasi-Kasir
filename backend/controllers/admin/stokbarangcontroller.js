import Barang from "../../models/databarang.js";
import cloudinary from "../../config/cloudinary.js";
import Settings from "../../models/settings.js"; 

// GET semua barang
export const getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.find();
    const barangWithCalc = barang.map(item => {
      let status = "aman";
      if (item.stok === 0) status = "habis";
      else if (item.stok <= (item.stok_minimal || 5)) status = "hampir habis";

      return {
        ...item.toObject(),
        hargaFinal: parseFloat(item.hargaFinal.toFixed(2)),
        status
      };
    });
    res.json(barangWithCalc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah barang
export const createBarang = async (req, res) => {
  try {
    let gambarUrl = "";

    // Upload gambar ke Cloudinary (jika ada)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "barang",
      });
      gambarUrl = result.secure_url;
    }

    // Ambil pengaturan pajak & diskon dari Settings (gunakan yang pertama)
    const settings = await Settings.findOne();
    const taxRate = settings?.taxRate || 0;
    const discount = settings?.globalDiscount || 0;

    // Hitung harga akhir:
    // hargaFinal = hargaJual + pajak - diskon
    const hargaJual = parseFloat(req.body.harga_jual);
    const pajak = (hargaJual * taxRate) / 100;
    const potongan = (hargaJual * discount) / 100;

    const hargaFinal = hargaJual + pajak - potongan;

    // Simpan barang
    const barang = new Barang({
      ...req.body,
      hargaFinal,
      gambar_url: gambarUrl,
    });

    await barang.save();
    res.status(201).json({ 
      message: "Barang berhasil ditambahkan!", 
      barang,
      perhitungan: { taxRate, discount, pajak, potongan, hargaFinal }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update barang
export const updateBarang = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "barang",
      });
      updateData.gambar_url = result.secure_url;
    }

    const barang = await Barang.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });

    res.json({ message: "Barang berhasil diperbarui!", barang });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hapus barang
export const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByIdAndDelete(req.params.id);
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });
    res.json({ message: "Barang berhasil dihapus!", deletedId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};