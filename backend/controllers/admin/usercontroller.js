import User from "../../models/user.js";

// Ambil semua user
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};

// Tambah user
export const addUser = async (req, res) => {
  try {
    console.log("📩 Data diterima:", req.body);
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: "User berhasil ditambahkan!" });
  } catch (err) {
    console.error("❌ Error saat simpan:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Hapus user berdasarkan ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus user", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json({ message: "User berhasil diperbarui!", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};