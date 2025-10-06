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
    } else if(role === "kasir"){
      message = "Kasir berhasil ditambahkan!";
    } else {
      message = "User Berhasil Didaftarkan!";
    }

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: "Error register user", error: err.message });
  }
};
