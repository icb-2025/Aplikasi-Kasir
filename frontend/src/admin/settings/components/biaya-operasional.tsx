// src/admin/settings/components/biaya-operasional.tsx
import React, { useState, useEffect, useCallback } from 'react';
import SweetAlert from '../../../components/SweetAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
const ipbe = import.meta.env.VITE_IPBE;


export interface BiayaOperasionalData {
  _id?: string;
  listrik: number;
  air: number;
  internet: number;
  sewa_tempat: number;
  gaji_karyawan: number;
  total: number;
  createdAt?: string;
  __v?: number;
}

interface BiayaOperasionalSettingsProps {
  onSaveBiayaOperasional: (data: BiayaOperasionalData) => Promise<void>;
  saving: boolean;
}

const BiayaOperasionalSettings: React.FC<BiayaOperasionalSettingsProps> = ({ 
  onSaveBiayaOperasional, 
  saving 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [biayaData, setBiayaData] = useState<BiayaOperasionalData>({
    listrik: 0,
    air: 0,
    internet: 0,
    sewa_tempat: 0,
    gaji_karyawan: 0,
    total: 0,
  });

  const BASE_API_URL = `${ipbe}:5000/api/admin/biaya-operasional`;
  const API_KEY = 'GPJbke7X3vAP0IBiiP8A';

  // Fungsi untuk mendapatkan token dari localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchBiayaOperasional = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-api-key'] = API_KEY;
      }

      const response = await fetch(BASE_API_URL, { headers });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data biaya operasional');
      }
      
      const data = await response.json();
      
      if (data && Object.keys(data).length > 0) {
        setBiayaData(data);
      }
    } catch (error) {
      SweetAlert.error('Gagal memuat data biaya operasional');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [BASE_API_URL, API_KEY]);

  useEffect(() => {
    fetchBiayaOperasional();
  }, [fetchBiayaOperasional]);

  const handleBiayaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    
    setBiayaData(prev => {
      const updatedData = {
        ...prev,
        [name]: numericValue
      };
      
      // Hitung total otomatis
      updatedData.total = 
        updatedData.listrik + 
        updatedData.air + 
        updatedData.internet + 
        updatedData.sewa_tempat + 
        updatedData.gaji_karyawan;
      
      return updatedData;
    });
  };

  const handleSubmitBiaya = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveBiayaOperasional(biayaData);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Biaya Operasional</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listrik</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              name="listrik"
              value={biayaData.listrik}
              onChange={handleBiayaChange}
              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Air</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              name="air"
              value={biayaData.air}
              onChange={handleBiayaChange}
              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internet</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              name="internet"
              value={biayaData.internet}
              onChange={handleBiayaChange}
              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sewa Tempat</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              name="sewa_tempat"
              value={biayaData.sewa_tempat}
              onChange={handleBiayaChange}
              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Karyawan</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              name="gaji_karyawan"
              value={biayaData.gaji_karyawan}
              onChange={handleBiayaChange}
              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              name="total"
              value={biayaData.total}
              readOnly
              className="pl-8 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmitBiaya}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Biaya Operasional'}
        </button>
      </div>
    </div>
  );
};

export default BiayaOperasionalSettings;