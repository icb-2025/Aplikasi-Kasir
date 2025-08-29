import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { nama_lengkap, username, password, role } = req.body;

    const newUser = new User({ nama_lengkap, username, password, role });
    await newUser.save();

    res.status(201).json({ message: "User berhasil dibuat!" });
  } catch (err) {
    res.status(500).json({ message: "Error register user", error: err.message });
  }
};