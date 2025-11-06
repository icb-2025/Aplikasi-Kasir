import cloudinary from "../../../config/cloudinary.js";
import streamifier from "streamifier";
import User from "../../../models/user.js";

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
