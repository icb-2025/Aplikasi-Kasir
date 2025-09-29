import React from 'react';

interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

interface OmzetSummaryProps {
  omzetData: OmzetData | null;
}

const OmzetSummary: React.FC<OmzetSummaryProps> = ({ omzetData }) => {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Analisis Performa Omzet</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Omzet toko menunjukkan pertumbuhan positif dengan peningkatan sebesar 12.5% dibandingkan hari sebelumnya.
              Pencapaian bulan ini sudah mencapai {omzetData ? `${Math.round((omzetData.bulan_ini / 2000000000) * 100)}%` : '0%'} 
              dari target bulanan.
            </p>
            <p className="mt-2">
              Berdasarkan tren saat ini, diprediksi omzet akan terus meningkat sebesar 5-10% di bulan depan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmzetSummary;