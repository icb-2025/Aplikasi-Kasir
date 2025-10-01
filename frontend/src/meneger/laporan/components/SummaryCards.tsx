
// src/meneger/laporan/components/SummaryCards.tsx
import React from 'react';

interface SummaryCardsProps {
  totalLaba: number;
  totalTransaksi: number;
  periodeStart?: string;
  periodeEnd?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalLaba,
  totalTransaksi,
  periodeStart,
  periodeEnd
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-green-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Laba</h3>
            <p className="text-2xl font-bold text-green-600">Rp {totalLaba?.toLocaleString('id-ID') || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-blue-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
            <p className="text-2xl font-bold text-blue-600">{totalTransaksi || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-purple-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Periode Laporan</h3>
            <p className="text-sm font-semibold text-gray-700">
              {periodeStart ? new Date(periodeStart).toLocaleDateString('id-ID') : 'N/A'} - 
              {periodeEnd ? new Date(periodeEnd).toLocaleDateString('id-ID') : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;