// src/admin/biaya/biaya-layanan/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import SweetAlert from '../../../components/SweetAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Tabs from './components/tabs';
import BiayaOperasional from './components/biaya-operasional';
import BiayaLanjutan from './components/biaya-lanjutan';
import BiayaService from './components/biaya-service';
import { portbe } from '../../../../../backend/ngrokbackend';
import type { BiayaOperasionalData } from './components/biaya-operasional';

const ipbe = import.meta.env.VITE_IPBE;
const ApiKey = import.meta.env.VITE_API_KEY;

const BiayaLayanan: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('operasional');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [lowStockAlert, setLowStockAlert] = useState<number>(0);
  const [totalBiayaOperasional, setTotalBiayaOperasional] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const BASE_API_URL = `${ipbe}:${portbe}/api/admin/settings`;
  const BIAYA_OPERASIONAL_API_URL = `${ipbe}:${portbe}/api/admin/biaya-operasional`;
  const API_KEY = `${ApiKey}`;

  // Fungsi untuk mendapatkan token dari localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchSettings = useCallback(async () => {
    try {
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
        throw new Error('Gagal mengambil data pengaturan');
      }
      
      const data = await response.json();
      
      if (data) {
        if (typeof data.taxRate === 'number') setTaxRate(data.taxRate);
        if (typeof data.globalDiscount === 'number') setGlobalDiscount(data.globalDiscount);
        if (typeof data.serviceCharge === 'number') setServiceCharge(data.serviceCharge);
        if (typeof data.lowStockAlert === 'number') setLowStockAlert(data.lowStockAlert);
      }
    } catch (error) {
      SweetAlert.error('Gagal memuat data pengaturan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [BASE_API_URL, API_KEY]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Auto refresh setiap 3 detik
useEffect(() => {
  const interval = setInterval(() => {
    fetchSettings();
  }, 3000);

  return () => clearInterval(interval);
}, [fetchSettings]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      // Update state sesuai dengan nama field
      if (name === 'taxRate') setTaxRate(checked ? 1 : 0);
      else if (name === 'globalDiscount') setGlobalDiscount(checked ? 1 : 0);
      else if (name === 'serviceCharge') setServiceCharge(checked ? 1 : 0);
      else if (name === 'lowStockAlert') setLowStockAlert(checked ? 1 : 0);
    } else {
      // Update state sesuai dengan nama field
      if (name === 'taxRate') setTaxRate(parseFloat(value) || 0);
      else if (name === 'globalDiscount') setGlobalDiscount(parseFloat(value) || 0);
      else if (name === 'serviceCharge') setServiceCharge(parseFloat(value) || 0);
      else if (name === 'lowStockAlert') setLowStockAlert(parseFloat(value) || 0);
    }
  };

  const handleSaveBiayaOperasional = async (data: BiayaOperasionalData) => {
    try {
      setSaving(true);
      SweetAlert.loading('Menyimpan biaya operasional...');
      
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-api-key'] = API_KEY;
      }
      
      const response = await fetch(BIAYA_OPERASIONAL_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal menyimpan biaya operasional');
      }
      
      SweetAlert.close();
      SweetAlert.success('Biaya operasional berhasil disimpan');
      
      // Trigger refresh data di komponen BiayaOperasional
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal menyimpan biaya operasional');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      SweetAlert.loading('Menyimpan pengaturan...');
      
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-api-key'] = API_KEY;
      }
      
      // Simpan pajak
      const taxResponse = await fetch(`${BASE_API_URL}/tax`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ taxRate })
      });
      
      if (!taxResponse.ok) {
        const errorData = await taxResponse.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal menyimpan pajak');
      }
      
      // Simpan diskon global
      const discountResponse = await fetch(`${BASE_API_URL}/discount`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ globalDiscount })
      });
      
      if (!discountResponse.ok) {
        const errorData = await discountResponse.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal menyimpan diskon global');
      }
      
      // Simpan peringatan stok rendah
      const stockResponse = await fetch(`${BASE_API_URL}/general`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ lowStockAlert })
      });
      
      if (!stockResponse.ok) {
        const errorData = await stockResponse.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal menyimpan peringatan stok rendah');
      }
      
      SweetAlert.close();
      SweetAlert.success('Pengaturan berhasil disimpan');
      fetchSettings();
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'operasional' && (
            <BiayaOperasional 
              onSaveBiayaOperasional={handleSaveBiayaOperasional}
              saving={saving}
              refreshTrigger={refreshTrigger}
              onTotalChange={setTotalBiayaOperasional}
            />
          )}
          
          {activeTab === 'layanan' && (
            <BiayaLanjutan 
              taxRate={taxRate}
              globalDiscount={globalDiscount}
              serviceCharge={serviceCharge}
              lowStockAlert={lowStockAlert}
              totalBiayaOperasional={totalBiayaOperasional}
              onInputChange={handleInputChange}
            />
          )}
          
          {activeTab === 'service' && (
            <BiayaService refreshTrigger={refreshTrigger} />
          )}
        </div>

        {/* Tombol simpan untuk tab layanan */}
        {activeTab === 'layanan' && (
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiayaLayanan;