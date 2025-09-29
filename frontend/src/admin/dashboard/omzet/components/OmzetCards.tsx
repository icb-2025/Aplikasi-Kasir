import React from 'react';


interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

interface OmzetCardsProps {
  omzetData: OmzetData | null;
  formatRupiah: (amount: number) => string;
}

const OmzetCards: React.FC<OmzetCardsProps> = ({ omzetData, formatRupiah }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Kartu Hari Ini */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform transition-transform hover:scale-105">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium opacity-80">Omzet Hari Ini</h3>
            <p className="text-3xl font-bold mt-2">
              {omzetData ? formatRupiah(omzetData.hari_ini) : 'Rp 0'}
            </p>
          </div>
          <div className="p-3 rounded-full bg-blue-400 bg-opacity-30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
            +12.5% dari kemarin
          </span>
        </div>
      </div>

      {/* Kartu Minggu Ini */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform transition-transform hover:scale-105">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium opacity-80">Omzet Minggu Ini</h3>
            <p className="text-3xl font-bold mt-2">
              {omzetData ? formatRupiah(omzetData.minggu_ini) : 'Rp 0'}
            </p>
          </div>
          <div className="p-3 rounded-full bg-green-400 bg-opacity-30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
            +8.3% dari minggu lalu
          </span>
        </div>
      </div>

      {/* Kartu Bulan Ini */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform transition-transform hover:scale-105">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium opacity-80">Omzet Bulan Ini</h3>
            <p className="text-3xl font-bold mt-2">
              {omzetData ? formatRupiah(omzetData.bulan_ini) : 'Rp 0'}
            </p>
          </div>
          <div className="p-3 rounded-full bg-purple-400 bg-opacity-30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
            +15.2% dari bulan lalu
          </span>
        </div>
      </div>
    </div>
  );
};

export default OmzetCards;