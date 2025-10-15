import Settings from "../../models/settings.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

// Ambil semua pengaturan
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ taxRate: 0, globalDiscount: 0 });
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
    if (typeof taxRate !== "number" || taxRate < 0) {
      return res.status(400).json({ message: "Pajak harus berupa angka positif" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ taxRate, globalDiscount: 0 });
    } else {
      settings.taxRate = taxRate;
      await settings.save();
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
    if (typeof globalDiscount !== "number" || globalDiscount < 0) {
      return res.status(400).json({ message: "Diskon harus berupa angka positif" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ taxRate: 0, globalDiscount });
    } else {
      settings.globalDiscount = globalDiscount;
      await settings.save();
    }

    res.json({ message: "Diskon global berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update pengaturan struk
export const updateReceipt = async (req, res) => {
  try {
    const { receiptHeader, receiptFooter } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        taxRate: 0,
        globalDiscount: 0,
        receiptHeader,
        receiptFooter,
      });
    } else {
      if (receiptHeader !== undefined) settings.receiptHeader = receiptHeader;
      if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
      await settings.save();
    }

    res.json({ message: "Struk berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tambah metode pembayaran baru
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



export const updatePaymentMethods = async (req, res) => {
  try {
    const { payment_methods } = req.body;

    let methods = JSON.parse(payment_methods);

    // Kalau ada file upload → simpan ke channel yang dimaksud
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "payment_methods",
      });

      fs.unlinkSync(req.file.path);

      // Misalnya kamu mau update logo channel Dana
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

// Update logo khusus channel
export const updateChannelLogo = async (req, res) => {
  try {
    const { methodName, channelName } = req.body;

    if (!methodName) {
      return res.status(400).json({ message: "methodName wajib diisi" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "File logo belum diupload" });
    }

    // Upload ke Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "payment_methods",
    });
    fs.unlinkSync(req.file.path);

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

    // 🔹 Kalau QRIS → simpan logo langsung di method
    if (methodName === "QRIS") {
      method.logo = uploadResult.secure_url;
    } else {
      // 🔹 Kalau bukan QRIS → tetap pakai channel
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
