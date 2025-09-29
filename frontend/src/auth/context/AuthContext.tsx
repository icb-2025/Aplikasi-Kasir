import React, { createContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  nama_lengkap?: string;
  role: 'admin' | 'manajer' | 'kasir';
  status?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (nama_lengkap: string, username: string, password: string, role: 'admin' | 'manajer' | 'kasir') => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL API
const API_BASE_URL = 'http://192.168.110.16:5000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Hapus data yang tidak valid
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    
    try {
      const url = `${API_BASE_URL}/auth/login`;
      console.log('Mencoba mengakses URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        // Jika bukan JSON, baca sebagai teks dan log untuk debugging
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        return { 
          success: false, 
          message: `Login gagal: ${response.status} ${response.statusText}` 
        };
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        // Jika response tidak OK, kembalikan pesan error dari backend
        return { 
          success: false, 
          message: data.message || `Login gagal: ${response.status} ${response.statusText}` 
        };
      }
      
      // Simpan token dan user data ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Tangani error jaringan atau error lainnya
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nama_lengkap: string, username: string, password: string, role: 'admin' | 'manajer' | 'kasir'): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    
    try {
      const url = `${API_BASE_URL}/auth/register`;
      console.log('Mencoba mengakses URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nama_lengkap, username, password, role })
      });
      
      console.log('Response status:', response.status);
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        // Jika bukan JSON, baca sebagai teks dan log untuk debugging
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        return { 
          success: false, 
          message: `Registrasi gagal: ${response.status} ${response.statusText}` 
        };
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || `Registrasi gagal: ${response.status} ${response.statusText}` 
        };
      }
      
      // Registrasi berhasil, login otomatis
      return await login(username, password);
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const url = `${API_BASE_URL}/auth/logout`;
        console.log('Mencoba mengakses URL:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // Log error response untuk debugging
          const errorText = await response.text();
          console.error('Logout error response:', errorText);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Hapus data dari localStorage dan state
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Redirect ke halaman login
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;