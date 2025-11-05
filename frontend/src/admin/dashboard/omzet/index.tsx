import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import OmzetCards from './components/OmzetCards';
import OmzetChart from './components/OmzetChart';
import OmzetTable from './components/OmzetTable';
import OmzetSummary from './components/OmzetSummary';
import { exportOmzetToCsv, exportOmzetToExcel, exportOmzetToPdf } from '@/admin/utils/OmzetExport';
import { formatRupiah } from '@/admin/utils/formatRupiah';
import { portbe } from '../../../../../backend/ngrokbackend';
const ipbe = import.meta.env.VITE_IPBE;
interface OmzetData {
  omzet: {
    hari_ini: number;
    minggu_ini: number;
    bulan_ini: number;
  };
}

const OmzetPage: React.FC = () => {
  const [omzetData, setOmzetData] = useState<OmzetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'hari' | 'minggu' | 'bulan'>('hari');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchOmzetData = useCallback(async (showNotification = false) => {
    try {
     
      // Tambahkan parameter periode ke URL
      const response = await fetch(`${ipbe}:${portbe}/api/admin/dashboard/omzet?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: OmzetData = await response.json();
      setOmzetData(data);
      
      if (showNotification) {
        setNotification({message: 'Data berhasil diperbarui', type: 'success'});
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data omzet';
      setError(errorMessage);
      
      if (showNotification) {
        setNotification({message: 'Gagal memperbarui data', type: 'error'});
        setTimeout(() => setNotification(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]); // Tambahkan selectedPeriod sebagai dependency

  useEffect(() => {
    fetchOmzetData();
  }, [fetchOmzetData]); // Tambahkan fetchOmzetData sebagai dependency

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Laporan Omzet</h1>
          <p className="text-gray-600">Analisis performa omzet toko</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">Gagal memuat data: {error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Laporan Omzet</h1>
          <p className="text-gray-600">Analisis performa omzet toko</p>
        </div>
        <div className="flex space-x-2">        
          <div className="relative group">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button 
                onClick={() => exportOmzetToCsv(omzetData?.omzet || null)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
              >
                Export CSV
              </button>
              <button 
                onClick={() => exportOmzetToExcel(omzetData?.omzet || null)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
              >
                Export Excel
              </button>
              <button 
                onClick={() => exportOmzetToPdf(omzetData?.omzet || null)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Statistik */}
      <OmzetCards 
        omzetData={omzetData?.omzet || null} 
        formatRupiah={formatRupiah} 
      />

      {/* Grafik Omzet */}
      <OmzetChart 
        omzetData={omzetData?.omzet || null} 
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        formatRupiah={formatRupiah}
      />

      {/* Tabel Detail Omzet */}
      <OmzetTable 
        omzetData={omzetData?.omzet || null} 
        formatRupiah={formatRupiah} 
      />

      {/* Ringkasan */}
      <OmzetSummary 
        omzetData={omzetData?.omzet || null} 
      />
    </div>
  );
};

export default OmzetPage;