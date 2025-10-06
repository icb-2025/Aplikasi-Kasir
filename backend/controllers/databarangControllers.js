import Barang from "../models/databarang.js";
import Settings from "../models/settings.js";
// Ambil semua barang
// Ambil semua barang + tambahkan pajak & diskon global
export const getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.find();

    const barangWithCalc = barang.map(item => {
      let status = "aman";
      if (item.stok === 0) status = "habis";
      else if (item.stok <= (item.stok_minimal || 5)) status = "hampir habis";

      return {
        ...item.toObject(),
        hargaFinal: Math.round(item.hargaFinal),
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
    const barang = new Barang(req.body);
    await barang.save();
    res.status(201).json({ message: "Barang berhasil ditambahkan!", barang });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update barang
// export const updateBarang = async (req, res) => {
//   try {
//     const barang = await Barang.findByIdAndUpdate(
//       req.params.id, 
//       req.body, 
//       { new: true }
//     );
//     if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });
//     res.json({ message: "Barang berhasil diperbarui!", barang });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

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
    res.json({ message: "Barang berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};