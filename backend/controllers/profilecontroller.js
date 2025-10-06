import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import User from "../models/user.js";
export const updateUser = async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.id.toString()) {
      return res.status(403).json({ message: "Tidak bisa mengubah data user lain" });
    }

    const updates = {};
    if (req.body.nama_lengkap) updates.nama_lengkap = req.body.nama_lengkap;
    if (req.body.username) updates.username = req.body.username;
    if (req.body.password) updates.password = req.body.password;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    Object.assign(user, updates);
    await user.save();

    res.json({ message: "User berhasil diperbarui!", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const updateUserProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    // Cek kalau bukan dirinya
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Tidak bisa mengubah profile orang lain" });
    }

    // Cek file
    if (!req.file) {
      return res.status(400).json({ message: "File foto belum diunggah" });
    }

    // Cari user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Pengguna Tidak Ditemukan" });
    }

    // Hitung jumlah update dalam 7 hari terakhir
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentUpdates = (user.profilePictureUpdates || []).filter(
      (update) => update.updatedAt >= oneWeekAgo
    );

    if (recentUpdates.length >= 1) {
      return res.status(429).json({ 
        message: "Anda Telah Melewati Batas Maksimal, Ganti Kembali Dalam 1 Minggu" 
      });
    }

    // Upload ke Cloudinary
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

    // Simpan foto baru
    user.profilePicture = uploadResult.secure_url;

    // Tambahkan riwayat update
    user.profilePictureUpdates = [
      ...(user.profilePictureUpdates || []),
      { updatedAt: new Date() }
    ];

    await user.save();

    res.json({ 
      message: "Foto Profile Berhasil Diperbarui", 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; // ambil dari token middleware

    const user = await User.findById(userId).select("profilePicture username nama_lengkap");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Kalau user belum punya foto
    if (!user.profilePicture) {
      return res.status(200).json({ 
        message: "Belum ada foto profil",
        profilePicture: null 
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil foto profil",
      profilePicture: user.profilePicture,
      nama_lengkap: user.nama_lengkap,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
