import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    console.log("LoginSuccess component mounted");
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    console.log("Token from URL:", token);

    if (token) {
      console.log("Token found, saving to localStorage");
      // Simpan token ke localStorage
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage");
      
      console.log("Processing Google token...");
      // Proses token Google
      auth.handleGoogleToken(token)
        .then(() => {
          console.log("Google token processed successfully");
          // Redirect ke halaman utama setelah login berhasil
          const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
          console.log("Redirecting to:", redirectPath);
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        })
        .catch((err) => {
          console.error('Error processing Google token:', err);
          // Jika terjadi error, hapus token dari localStorage
          localStorage.removeItem("token");
          navigate("/login");
        });
    } else {
      console.log("No token found in URL");
      // Jika tidak ada token, redirect ke halaman login
      navigate("/login");
    }
  }, [navigate, auth]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Sedang memproses login...</p>
      </div>
    </div>
  );
}