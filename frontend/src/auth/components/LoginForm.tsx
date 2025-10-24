// src/auth/components/LoginForm.tsx
import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import type { Variants } from "framer-motion";
import logologin from '../../images/logologin.jpg';
import googleLogo from '../../images/google.jpg';
import {ngrokBackend} from '../../../ngrokfrontend.ts'

export default function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ username: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ngfb = ngrokBackend()

  // Cleanup useEffect untuk mereset status loading saat komponen unmount
  useEffect(() => {
    return () => {
      if (isGoogleLoading) {
        setIsGoogleLoading(false);
      }
    };
  }, [isGoogleLoading]);

  useEffect(() => {
    if (auth.user && !auth.isLoading) {
      const from = location.state?.from?.pathname || '/';
      
      if (auth.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (auth.user.role === 'manajer') {
        navigate('/manajer/dashboard');
      } else if (auth.user.role === 'kasir') {
        navigate('/kasir/dashboard');
      } else {
        navigate(from);
      }
    }
  }, [auth.user, auth.isLoading, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleFocus = (field: 'username' | 'password') => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: 'username' | 'password') => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
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
      
      const result = await auth.login(form.username, form.password);
      
      if (!result.success) {
        setError(result.message || "Username atau password salah");
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Simpan URL saat ini untuk redirect setelah login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    // Arahkan ke endpoint Google OAuth
    window.location.href = `${ngfb}/api/auth/google`;
  };

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

  const inputVariants: Variants = {
    rest: { scale: 1 },
    focus: { 
      scale: 1.02,
      transition: { type: "spring" as const, stiffness: 300, damping: 10 }
    }
  };

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
      <motion.div
        variants={leftVariants}
        className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-500 to-yellow-400 text-white flex-col justify-center items-center p-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={logologin} 
            alt="Kasir App Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 to-yellow-400/80"></div>
        </div>
        
        <motion.div 
          className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-yellow-500 opacity-20"
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
          className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-orange-500 opacity-20"
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
        
        <div className="z-10 flex flex-col items-center justify-center">
          <motion.h1 
            className="text-5xl font-bold mb-6 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Kasir App
          </motion.h1>
          <motion.p 
            className="text-xl max-w-md text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Kelola transaksi dan produk dengan mudah, cepat, dan aman.
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        variants={rightVariants}
        className="flex w-full md:w-1/2 justify-center items-center bg-gradient-to-br from-amber-50 to-yellow-50 p-6"
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
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
              Selamat Datang 
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Silakan login untuk melanjutkan
            </p>
          </motion.div>

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

          <motion.div 
            className="mb-6"
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            animate={isFocused.username ? "focus" : "rest"}
          >
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-3 focus-within:border-orange-500 transition-colors">
              <motion.div
                animate={{ color: isFocused.username ? "#F97316" : "#9CA3AF" }}
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

          <motion.div 
            className="mb-8"
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            animate={isFocused.password ? "focus" : "rest"}
          >
            <div className="flex items-center border-2 border-gray-200 rounded-xl p-3 focus-within:border-orange-500 transition-colors">
              <motion.div
                animate={{ color: isFocused.password ? "#F97316" : "#9CA3AF" }}
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

          <motion.button
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mb-4"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : 'Login'}
          </motion.button>

          <motion.button
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 mb-6"
          >
            {isGoogleLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              <>
                <img 
                  src={googleLogo} 
                  alt="Google Logo" 
                  className="w-5 h-5 mr-3"
                />
                Login dengan Google
              </>
            )}
          </motion.button>

          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-600 text-sm">
              Belum punya akun?{' '}
              <motion.button
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                type="button"
                onClick={() => navigate('/register')}
                className="text-orange-500 hover:text-orange-700 font-medium"
              >
                Daftar di sini
              </motion.button>
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