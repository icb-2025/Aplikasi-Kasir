import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import type { Variants } from "framer-motion";

export default function RegisterForm() {
  const [form, setForm] = useState({ 
    nama_lengkap: "", 
    username: "", 
    password: "", 
    confirmPassword: ""
    // Hapus field role karena akan otomatis 'users'
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ 
    nama_lengkap: false, 
    username: false, 
    password: false,
    confirmPassword: false
    // Hapus field role
  });
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleFocus = (field: 'nama_lengkap' | 'username' | 'password' | 'confirmPassword') => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: 'nama_lengkap' | 'username' | 'password' | 'confirmPassword') => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Validasi input
      if (!form.nama_lengkap.trim()) {
        setError("Nama lengkap tidak boleh kosong");
        setIsLoading(false);
        return;
      }
      
      if (!form.username.trim()) {
        setError("Username tidak boleh kosong");
        setIsLoading(false);
        return;
      }
      
      if (!form.password.trim()) {
        setError("Password tidak boleh kosong");
        setIsLoading(false);
        return;
      }
      
      if (form.password !== form.confirmPassword) {
        setError("Password dan konfirmasi password tidak cocok");
        setIsLoading(false);
        return;
      }
      
      if (form.password.length < 6) {
        setError("Password minimal 6 karakter");
        setIsLoading(false);
        return;
      }
      
      // Hardcode role sebagai 'users'
      const result = await auth.register(
        form.nama_lengkap, 
        form.username, 
        form.password, 
        'users' // Role otomatis 'users'
      );
      
      if (!result.success) {
        setError(result.message || "Registrasi gagal");
      } else {
        // Redirect ke halaman login setelah registrasi berhasil
        navigate('/login');
      }
    } catch (err: unknown) {
      console.error('Register error:', err);
      setError("Terjadi kesalahan saat registrasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animasi untuk container utama
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  // Animasi untuk bagian kiri
  const leftVariants: Variants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        damping: 15, 
        stiffness: 100 
      }
    }
  };

  // Animasi untuk bagian kanan
  const rightVariants: Variants = {
    hidden: { x: 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        damping: 15, 
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  // Animasi untuk form
  const formVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        damping: 20,
        stiffness: 100
      }
    }
  };

  // Animasi untuk input
  const inputVariants: Variants = {
    rest: { scale: 1 },
    focus: { 
      scale: 1.02,
      transition: { type: "spring" as const, stiffness: 300, damping: 10 }
    }
  };

  // Animasi untuk tombol
  const buttonVariants: Variants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: { type: "spring" as const, stiffness: 400, damping: 10 }
    },
    tap: { 
      scale: 0.97,
      transition: { type: "spring" as const, stiffness: 400, damping: 10 }
    }
  };

  // Animasi untuk error message
  const errorVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 15 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="flex h-screen w-full overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Bagian Kiri */}
      <motion.div
        variants={leftVariants}
        className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-col justify-center items-center p-10 relative"
      >
        <motion.div 
          className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-purple-500 opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-blue-500 opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.h1 
          className="text-5xl font-bold mb-6 z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Kasir App
        </motion.h1>
        <motion.p 
          className="text-xl max-w-md text-center z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Bergabunglah dengan kami untuk mengelola bisnis Anda dengan lebih efisien.
        </motion.p>
      </motion.div>

      {/* Bagian Kanan (Form) */}
      <motion.div
        variants={rightVariants}
        className="flex w-full md:w-1/2 justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      >
        <motion.form
          onSubmit={handleSubmit}
          variants={formVariants}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-sm bg-opacity-90"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 flex items-center justify-center">
              <FaUserPlus className="mr-2" /> Registrasi
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Buat akun baru untuk melanjutkan
            </p>
          </motion.div>

          {/* Error Message dengan animasi */}
          <AnimatePresence>
            {error && (
              <motion.div
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-4"
              >
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nama Lengkap Input */}
          <motion.div 
            className="mb-4"
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            animate={isFocused.nama_lengkap ? "focus" : "rest"}
          >
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-colors">
              <motion.div
                animate={{ color: isFocused.nama_lengkap ? "#3B82F6" : "#9CA3AF" }}
                transition={{ duration: 0.2 }}
              >
                <FaUser className="text-xl mr-3" />
              </motion.div>
              <input
                type="text"
                name="nama_lengkap"
                placeholder="Nama Lengkap"
                value={form.nama_lengkap}
                onChange={handleChange}
                onFocus={() => handleFocus('nama_lengkap')}
                onBlur={() => handleBlur('nama_lengkap')}
                className="w-full outline-none bg-transparent text-gray-700"
                required
              />
            </div>
          </motion.div>

          {/* Username Input */}
          <motion.div 
            className="mb-4"
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            animate={isFocused.username ? "focus" : "rest"}
          >
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-colors">
              <motion.div
                animate={{ color: isFocused.username ? "#3B82F6" : "#9CA3AF" }}
                transition={{ duration: 0.2 }}
              >
                <FaUser className="text-xl mr-3" />
              </motion.div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                onFocus={() => handleFocus('username')}
                onBlur={() => handleBlur('username')}
                className="w-full outline-none bg-transparent text-gray-700"
                required
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div 
            className="mb-4"
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            animate={isFocused.password ? "focus" : "rest"}
          >
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-colors">
              <motion.div
                animate={{ color: isFocused.password ? "#3B82F6" : "#9CA3AF" }}
                transition={{ duration: 0.2 }}
              >
                <FaLock className="text-xl mr-3" />
              </motion.div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                className="w-full outline-none bg-transparent text-gray-700"
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </motion.button>
            </div>
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div 
            className="mb-6"
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            animate={isFocused.confirmPassword ? "focus" : "rest"}
          >
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-colors">
              <motion.div
                animate={{ color: isFocused.confirmPassword ? "#3B82F6" : "#9CA3AF" }}
                transition={{ duration: 0.2 }}
              >
                <FaLock className="text-xl mr-3" />
              </motion.div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Konfirmasi Password"
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                className="w-full outline-none bg-transparent text-gray-700"
                required
              />
              <motion.button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </motion.button>
            </div>
          </motion.div>

          {/* Register Button */}
          <motion.button
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : 'Registrasi'}
          </motion.button>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Login
              </button>
            </p>
          </motion.div>

          <motion.p 
            className="text-center text-xs text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            © 2025 Kasir App. All rights reserved.
          </motion.p>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}