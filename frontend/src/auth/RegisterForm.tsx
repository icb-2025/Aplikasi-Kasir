// src/auth/RegisterForm.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaUserShield } from "react-icons/fa";
import { portbe } from "../../../backend/ngrokbackend";
const ipbe = import.meta.env.VITE_IPBE;


export default function RegisterForm() {
  const [form, setForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    role: "kasir",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${ipbe}:${portbe}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Register gagal");
      }

      setSuccess("Register berhasil! Silakan login.");
      setError("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Register gagal, coba lagi.");
      }
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Bagian Kiri */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">Daftar Akun Baru</h1>
        <p className="text-lg max-w-md text-center">
          Buat akun Anda untuk mulai mengelola transaksi dan produk.
        </p>
      </div>

      {/* Bagian Kanan (Form) */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50 p-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center mb-2">
            Buat Akun 🚀
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Silakan isi data untuk registrasi
          </p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

          <div className="flex items-center border rounded-lg mb-4 p-2">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              name="nama_lengkap"
              placeholder="Nama Lengkap"
              value={form.nama_lengkap}
              onChange={handleChange}
              className="w-full outline-none"
            />
          </div>


          <div className="flex items-center border rounded-lg mb-4 p-2">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full outline-none"
            />
          </div>

          <div className="flex items-center border rounded-lg mb-4 p-2">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full outline-none"
            />
          </div>

          <div className="flex items-center border rounded-lg mb-6 p-2">
            <FaUserShield className="text-gray-400 mr-2" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full outline-none bg-transparent"
            >
              <option value="manager">Manager</option>
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            © 2025 Kasir App. All rights reserved.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
