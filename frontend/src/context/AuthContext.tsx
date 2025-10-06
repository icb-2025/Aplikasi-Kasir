import React, { createContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id?: string; // Opsional, karena kadang menggunakan _id
  _id?: string; // Opsional, karena kadang menggunakan id
  nama_lengkap: string;
  username?: string;
  role: 'admin' | 'manajer' | 'kasir' | 'users';
  status: string;
  profilePicture?: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface LogoutResponse {
  message: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  defaultProfilePicture: string;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (nama_lengkap: string, username: string, password: string, role: 'admin' | 'manajer' | 'kasir' | 'users') => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfilePicture: (profilePicture: File) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (profileData: {
    nama_lengkap: string;
    username: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  getDefaultProfilePicture: () => Promise<{ success: boolean; defaultProfilePicture?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const _meta = import.meta as { env?: { VITE_API_BASE_URL?: string; VITE_API_KEY?: string } };
const API_BASE_URL = _meta.env?.VITE_API_BASE_URL ?? 'http://192.168.110.16:5000';
const API_KEY = _meta.env?.VITE_API_KEY ?? 'GPJbke7X3vAP0IBiiP8A';

function isAxiosError(error: unknown): error is { isAxiosError: true; response?: { data?: ErrorResponse }; message?: string } {
  return typeof error === 'object' && error !== null && 'isAxiosError' in (error as Record<string, unknown>) && (error as Record<string, unknown>)['isAxiosError'] === true;
}

function getMessageFromUnknown(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as { message?: unknown };
  return typeof e.message === 'string' ? e.message : undefined;
}

interface ErrorResponse {
  message?: string;
}

// Helper function untuk mendapatkan ID user
function getUserId(user: User): string {
  // Prioritaskan _id jika ada, jika tidak gunakan id
  return user._id || user.id || '';
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultProfilePicture, setDefaultProfilePicture] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const fetchDefaultProfilePicture = useCallback(async (): Promise<{ success: boolean; defaultProfilePicture?: string; message?: string }> => {
    try {
      // PERBAIKI: Ganti endpoint dari /api/manager/settings ke /api/admin/settings
      const response = await axios.get<{ defaultProfilePicture: string }>(
        `${API_BASE_URL}/api/admin/settings`,
        {
          headers: {
            'x-api-key': API_KEY
          }
        }
      );

      console.log('Get default profile picture berhasil:', response.data);
      const defaultPic = response.data.defaultProfilePicture;
      setDefaultProfilePicture(defaultPic);
      return { success: true, defaultProfilePicture: defaultPic };
    } catch (error) {
      console.error('Get default profile picture gagal:', error);
      
      if (isAxiosError(error)) {
        const errorMessage = (error.response?.data as ErrorResponse)?.message ?? error.message;
        return { success: false, message: errorMessage || 'Terjadi kesalahan saat mendapatkan default profile picture' };
      }

      const fallback = getMessageFromUnknown(error);
      return { success: false, message: fallback ?? 'Terjadi kesalahan saat mendapatkan default profile picture' };
    }
  }, []);

  // Ambil default profile picture saat mount
  useEffect(() => {
    fetchDefaultProfilePicture();
  }, [fetchDefaultProfilePicture]);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
        username,
        password
      }, {
        headers: {
          'x-api-key': API_KEY
        }
      });

      console.log('Login berhasil:', response.data.user);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Login gagal:', error);

      if (isAxiosError(error)) {
        const errorMessage = (error.response?.data as ErrorResponse)?.message ?? error.message;
        return { success: false, message: errorMessage || 'Terjadi kesalahan saat login' };
      }

      const fallback = getMessageFromUnknown(error);
      return { success: false, message: fallback ?? 'Terjadi kesalahan saat login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (nama_lengkap: string, username: string, password: string, role: 'admin' | 'manajer' | 'kasir' | 'users'): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const response = await axios.post<RegisterResponse>(`${API_BASE_URL}/auth/register`, {
        nama_lengkap,
        username,
        password,
        role
      }, {
        headers: {
          'x-api-key': API_KEY
        }
      });

      console.log('Register berhasil:', response.data);

      return await login(username, password);
    } catch (error) {
      console.error('Register gagal:', error);

      if (isAxiosError(error)) {
        const errorMessage = (error.response?.data as ErrorResponse)?.message ?? error.message;
        return { success: false, message: errorMessage || 'Terjadi kesalahan saat registrasi' };
      }

      const fallback = getMessageFromUnknown(error);
      return { success: false, message: fallback ?? 'Terjadi kesalahan saat registrasi' };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    try {
      if (token) {
        const response = await axios.post<LogoutResponse>(`${API_BASE_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': API_KEY
          }
        });

        console.log(response.data.message);
      }
    } catch (error) {
      console.error('Logout gagal:', error);

      if (isAxiosError(error)) {
        const errorMessage = (error.response?.data as ErrorResponse)?.message ?? error.message;
        console.error('Logout error response:', errorMessage || error.response?.data);
      } else {
        console.error('Logout error:', getMessageFromUnknown(error) ?? error);
      }
    }
  }, []);

  const updateProfilePicture = useCallback(async (profilePicture: File): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Anda belum login' };
      }

      // Ambil data user terbaru dari localStorage untuk memastikan kita memiliki role dan ID yang benar
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user from localStorage:', currentUser);
      

      const userId = getUserId(currentUser); // Gunakan helper function

      if (!userId) {
        return { success: false, message: 'User ID tidak ditemukan' };
      }

      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      // Debug URL yang akan diakses
      const url = `${API_BASE_URL}/api/update-profile/${userId}/profile-picture`;
      console.log('Request URL:', url);

      const response = await axios.put<{ message: string; user: User }>(
        url,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': API_KEY
          }
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      console.log('Update profile picture berhasil:', response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Update profile picture gagal:', error);
      
      if (isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        const errorMessage = (error.response?.data as ErrorResponse)?.message ?? error.message;
        return { success: false, message: errorMessage || 'Terjadi kesalahan saat update profile picture' };
      }

      const fallback = getMessageFromUnknown(error);
      return { success: false, message: fallback ?? 'Terjadi kesalahan saat update profile picture' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: {
    nama_lengkap: string;
    username: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Anda belum login' };
      }

      // Ambil data user terbaru dari localStorage untuk memastikan kita memiliki role dan ID yang benar
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user from localStorage:', currentUser);
      
      const userRole = currentUser.role || 'users';
      const userId = getUserId(currentUser); // Gunakan helper function

      if (!userId) {
        return { success: false, message: 'User ID tidak ditemukan' };
      }

      // PERBAIKI: Hapus /profile-picture untuk update data biasa
      const url = `${API_BASE_URL}/api/update-profile/${userRole}/${userId}`;
      console.log('Request URL:', url);

      // Logging data yang akan dikirim
      console.log('Data yang akan dikirim:', profileData);

      const response = await axios.put<{ message: string; user: User }>(
        url,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': API_KEY
          }
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      console.log('Update profile berhasil:', response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Update profile gagal:', error);

      if (isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        const errorMessage = (error.response?.data as ErrorResponse)?.message ?? error.message;
        return { success: false, message: errorMessage || 'Terjadi kesalahan saat update profil' };
      }

      const fallback = getMessageFromUnknown(error);
      return { success: false, message: fallback ?? 'Terjadi kesalahan saat update profil' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // PERBAIKI: Tambahkan fungsi untuk mendapatkan data user lengkap
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }

      const response = await axios.get<{ user: User }>(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': API_KEY
          }
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Fetch current user failed:', error);
      return null;
    }
  }, []);

  // PERBAIKI: Ambil data user lengkap saat login
  useEffect(() => {
    if (user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  const value = useMemo(() => ({ 
    user, 
    isLoading, 
    defaultProfilePicture,
    login, 
    register, 
    logout, 
    updateProfilePicture,
    updateProfile,
    getDefaultProfilePicture: fetchDefaultProfilePicture,
    fetchCurrentUser // Tambahkan ini
  }), [user, isLoading, defaultProfilePicture, login, register, logout, updateProfilePicture, updateProfile, fetchDefaultProfilePicture, fetchCurrentUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;