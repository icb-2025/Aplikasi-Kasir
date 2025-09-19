import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { nama_lengkap, username, password, role } = req.body;

    const newUser = new User({ nama_lengkap, username, password, role });
    await newUser.save();
    
    let message = "";
    if (role === "admin") {
      message = "Admin berhasil ditambahkan!";
    } else if (role === "manajer") {
      message = "Manajer berhasil ditambahkan!";
    } else {
      message = "Kasir berhasil ditambahkan!";
    }

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: "Error register user", error: err.message });
  }
};
