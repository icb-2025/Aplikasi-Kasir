// controllers/admin/settingscontroller.js
import Settings from "../../models/settings.js";
import Barang from "../../models/databarang.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import User from "../../models/user.js";


// Ambil semua pengaturan
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update pajak
export const updateTax = async (req, res) => {
  try {
    const { taxRate } = req.body;
    if (typeof taxRate !== "number" || taxRate < 0)
      return res.status(400).json({ message: "Pajak harus berupa angka positif" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ taxRate });
    else settings.taxRate = taxRate;

    await settings.save();

    // 🔹 Update semua barang
    const barang = await Barang.find();
    for (let b of barang) {
      const discountRate = settings.globalDiscount || 0;
      const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * discountRate) / 100;
      b.hargaFinal = Number(
        (hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100).toFixed(2)
      );
      await b.save();
    }

    res.json({ message: "Pajak berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update diskon global
export const updateGlobalDiscount = async (req, res) => {
  try {
    const { globalDiscount } = req.body;
    if (typeof globalDiscount !== "number" || globalDiscount < 0)
      return res.status(400).json({ message: "Diskon harus berupa angka positif" });

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ globalDiscount });
    else settings.globalDiscount = globalDiscount;

    await settings.save();

    // 🔹 Update semua barang
    const barang = await Barang.find();
    for (let b of barang) {
      const taxRate = settings.taxRate || 0;
      const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * globalDiscount) / 100;
      b.hargaFinal = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
      await b.save();
    }

    res.json({ message: "Diskon global berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Update service charge
export const updateServiceCharge = async (req, res) => {
  try {
    const { serviceCharge } = req.body;
    if (typeof serviceCharge !== "number" || serviceCharge < 0) {
      return res
        .status(400)
        .json({ message: "Service charge harus berupa angka positif" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ serviceCharge });
    } else {
      settings.serviceCharge = serviceCharge;
      await settings.save();
    }

    // 🔹 Update semua barang dengan serviceCharge baru
    const barangList = await Barang.find();
    for (let b of barangList) {
      const taxRate = settings.taxRate || 0;
      const globalDiscount = settings.globalDiscount || 0;

      const hargaSetelahDiskon = b.harga_jual - (b.harga_jual * globalDiscount) / 100;
      const hargaSetelahPajak = hargaSetelahDiskon + (hargaSetelahDiskon * taxRate) / 100;
      const hargaFinal = hargaSetelahPajak + (hargaSetelahPajak * serviceCharge) / 100;

      b.hargaFinal = Math.round(hargaFinal);
      await b.save();
    }

    res.json({ message: "Service charge berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update pengaturan struk
export const updateReceipt = async (req, res) => {
  try {
    const { receiptHeader, receiptFooter, showBarcode, showCashierName } =
      req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        receiptHeader,
        receiptFooter,
        showBarcode,
        showCashierName,
      });
    } else {
      if (receiptHeader !== undefined) settings.receiptHeader = receiptHeader;
      if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
      if (showBarcode !== undefined) settings.showBarcode = showBarcode;
      if (showCashierName !== undefined)
        settings.showCashierName = showCashierName;
      await settings.save();
    }

    res.json({ message: "Struk berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update metode pembayaran
export const updatePaymentMethods = async (req, res) => {
  try {
    const { payment_methods } = req.body;

    let methods = JSON.parse(payment_methods);

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "payment_methods",
      });

      fs.unlinkSync(req.file.path);

      const { methodName, channelName } = req.body;

      methods = methods.map(m => {
        if (m.method === methodName) {
          m.channels = m.channels.map(c =>
            c.name === channelName
              ? { ...c, logo: uploadResult.secure_url }
              : c
          );
        }
        return m;
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ payment_methods: methods });
    } else {
      settings.payment_methods = methods;
      await settings.save();
    }

    res.json({ message: "Metode pembayaran berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateChannelLogo = async (req, res) => {
  try {
    const { methodName, channelName } = req.body;

    if (!methodName) {
      return res.status(400).json({ message: "methodName wajib diisi" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "File logo belum diupload" });
    }

    // 🔹 Upload ke Cloudinary pakai buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "payment_methods" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // Cari settings
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings tidak ditemukan" });
    }

    // Cari method
    const method = settings.payment_methods.find(m => m.method === methodName);
    if (!method) {
      return res.status(404).json({ message: `Metode ${methodName} tidak ditemukan` });
    }

    if (methodName === "QRIS") {
      method.logo = uploadResult.secure_url;
    } else {
      if (!channelName) {
        return res.status(400).json({ message: "channelName wajib diisi untuk method selain QRIS" });
      }

      const channel = method.channels.find(c => c.name === channelName);
      if (!channel) {
        return res.status(404).json({ message: `Channel ${channelName} tidak ditemukan` });
      }

      channel.logo = uploadResult.secure_url;
    }

    await settings.save();

    res.json({
      message:
        methodName === "QRIS"
          ? `Logo untuk ${methodName} berhasil diperbarui`
          : `Logo untuk ${channelName} berhasil diperbarui`,
      settings,
    });
  } catch (error) {
    console.error("updateChannelLogo error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const addPaymentMethod = async (req, res) => {
  try {
    const { method, channels } = req.body;

    if (!method) {
      return res.status(400).json({ message: "Nama method wajib diisi" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        payment_methods: [{ method, channels: channels || [] }],
      });
    } else {
      // cek kalau sudah ada method dengan nama sama
      const exists = settings.payment_methods.some(m => m.method === method);
      if (exists) {
        return res.status(400).json({ message: `Method ${method} sudah ada` });
      }

      settings.payment_methods.push({
        method,
        channels: channels || [],
      });
      await settings.save();
    }

    res.json({
      message: `Metode pembayaran ${method} berhasil ditambahkan!`,
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aktifkan atau nonaktifkan metode pembayaran
export const togglePaymentMethod = async (req, res) => {
  try {
    const { methodName, isActive } = req.body;

    if (!methodName || typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "methodName dan isActive (true/false) wajib diisi",
      });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings tidak ditemukan" });
    }

    const method = settings.payment_methods.find(
      (m) => m.method === methodName
    );
    if (!method) {
      return res
        .status(404)
        .json({ message: `Metode pembayaran ${methodName} tidak ditemukan` });
    }

    // Update status aktif
    method.isActive = isActive;
    await settings.save();

    res.json({
      message: `Metode pembayaran ${methodName} berhasil ${
        isActive ? "diaktifkan" : "dinonaktifkan"
      }`,
      settings,
    });
  } catch (error) {
    console.error("togglePaymentMethod error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Aktifkan atau nonaktifkan channel dalam metode pembayaran
export const toggleChannelStatus = async (req, res) => {
  try {
    const { methodName, channelName, isActive } = req.body;

    if (!methodName || !channelName || typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "methodName, channelName, dan isActive (true/false) wajib diisi",
      });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings tidak ditemukan" });
    }

    const method = settings.payment_methods.find(
      (m) => m.method === methodName
    );
    if (!method) {
      return res
        .status(404)
        .json({ message: `Metode pembayaran ${methodName} tidak ditemukan` });
    }

    const channel = method.channels.find((c) => c.name === channelName);
    if (!channel) {
      return res
        .status(404)
        .json({ message: `Channel ${channelName} tidak ditemukan di ${methodName}` });
    }

    // Update status aktif
    channel.isActive = isActive;
    await settings.save();

    res.json({
      message: `Channel ${channelName} pada metode ${methodName} berhasil ${
        isActive ? "diaktifkan" : "dinonaktifkan"
      }`,
      settings,
    });
  } catch (error) {
    console.error("toggleChannelStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Tambah channel baru ke method
export const addChannelToMethod = async (req, res) => {
  try {
    const { methodName, channelName } = req.body;

    if (!methodName || !channelName) {
      return res.status(400).json({ message: "methodName & channelName wajib diisi" });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings tidak ditemukan" });
    }

    const method = settings.payment_methods.find(m => m.method === methodName);
    if (!method) {
      return res.status(404).json({ message: `Method ${methodName} tidak ditemukan` });
    }

    // cek duplikat channel
    if (method.channels.some(c => c.name === channelName)) {
      return res.status(400).json({ message: `Channel ${channelName} sudah ada di ${methodName}` });
    }

    method.channels.push({ name: channelName });
    await settings.save();

    res.json({
      message: `Channel ${channelName} berhasil ditambahkan ke ${methodName}`,
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update nama channel
export const updateChannelName = async (req, res) => {
  try {
    const { methodName, oldChannelName, newChannelName } = req.body;

    if (!methodName || !oldChannelName || !newChannelName) {
      return res.status(400).json({ message: "methodName, oldChannelName, dan newChannelName wajib diisi" });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings tidak ditemukan" });
    }

    const method = settings.payment_methods.find(m => m.method === methodName);
    if (!method) {
      return res.status(404).json({ message: `Metode ${methodName} tidak ditemukan` });
    }

    const channel = method.channels.find(c => c.name === oldChannelName);
    if (!channel) {
      return res.status(404).json({ message: `Channel ${oldChannelName} tidak ditemukan` });
    }

    // Update nama
    channel.name = newChannelName;
    await settings.save();

    res.json({
      message: `Channel ${oldChannelName} berhasil diubah menjadi ${newChannelName}`,
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus channel dari metode pembayaran
export const deleteChannelFromMethod = async (req, res) => {
  try {
    const { methodName, channelName } = req.body;

    if (!methodName || !channelName) {
      return res.status(400).json({
        message: "methodName dan channelName wajib diisi",
      });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings tidak ditemukan" });
    }

    const method = settings.payment_methods.find(
      (m) => m.method === methodName
    );
    if (!method) {
      return res
        .status(404)
        .json({ message: `Metode pembayaran ${methodName} tidak ditemukan` });
    }

    const channelIndex = method.channels.findIndex(
      (c) => c.name === channelName
    );
    if (channelIndex === -1) {
      return res
        .status(404)
        .json({ message: `Channel ${channelName} tidak ditemukan di ${methodName}` });
    }

    // Hapus channel dari daftar
    method.channels.splice(channelIndex, 1);
    await settings.save();

    res.json({
      message: `Channel ${channelName} berhasil dihapus dari ${methodName}`,
      settings,
    });
  } catch (error) {
    console.error("deleteChannelFromMethod error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update toko (nama, alamat, telepon, logo)
export const updateStoreInfo = async (req, res) => {
  try {
    const { storeName, storeAddress, storePhone } = req.body;
    let storeLogo;
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "store_logos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      storeLogo = uploadResult.secure_url;
    }
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        storeName,
        defaultUser,
        storeAddress,
        storePhone,
      });
    } else {
      if (storeName !== undefined) settings.storeName = storeName;
      if (storeLogo !== undefined) settings.storeLogo = storeLogo;
      if (storeAddress !== undefined) settings.storeAddress = storeAddress;
      if (storePhone !== undefined) settings.storePhone = storePhone;
      await settings.save();
    }
    res.json({ message: "Informasi toko berhasil diperbarui!", settings }); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateGeneralSettings = async (req, res) => {
  try {
    const { lowStockAlert, currency, dateFormat, language } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        lowStockAlert,
        currency,
        dateFormat,
        language,
      });
    } else {
      if (lowStockAlert !== undefined) settings.lowStockAlert = lowStockAlert;
      if (currency !== undefined) settings.currency = currency;
      if (dateFormat !== undefined) settings.dateFormat = dateFormat;
      if (language !== undefined) settings.language = language;
      await settings.save();
    }

    res.json({ message: "Pengaturan umum berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

};
export const updateDefaultProfilePicture = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Hanya admin yang bisa mengubah default profile picture" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File foto belum diunggah" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "default_profiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const settings = await Settings.findOneAndUpdate(
      {},
      { defaultProfilePicture: uploadResult.secure_url },
      { new: true, upsert: true }
    );

    res.json({ 
      message: "Default Profile Picture berhasil diperbarui", 
      settings 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Tidak bisa mengubah profile orang lain" });
    }

    // ✅ Debug kalau file tidak terkirim
    if (!req.file) {
      console.error("❌ Tidak ada file yang diterima di backend");
      console.log("Headers:", req.headers["content-type"]);
      console.log("Body keys:", Object.keys(req.body));
      console.log("req.file:", req.file);

      return res.status(400).json({
        message: "File foto belum diunggah",
        debug: {
          contentType: req.headers["content-type"],
          bodyKeys: Object.keys(req.body),
          fileReceived: !!req.file,
        },
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "user_profiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Pengguna Tidak Ditemukan" });
    }

    user.profilePicture = uploadResult.secure_url;
    await user.save();

    res.json({ message: "Foto Profile Berhasil Diperbarui", user });
  } catch (error) {
    console.error("🔥 Error updateUserProfilePicture:", error);
    res.status(500).json({ message: error.message });
  }
};

