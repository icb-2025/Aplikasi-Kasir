import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // cek user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    // update status jadi aktif kalau role kasir
    if (user.role === "kasir") {
      user.status = "aktif";
      await user.save();
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user && user.role === "kasir") {
      user.status = "nonaktif";
      await user.save();
    }

    res.json({ message: "Logout berhasil, kasir dinonaktifkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
