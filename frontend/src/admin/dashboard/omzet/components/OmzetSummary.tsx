// // omzetsummary.tsx
// import React from 'react';

// interface OmzetData {
//   hari_ini: number;
//   minggu_ini: number;
//   bulan_ini: number;
//   detail_hari: {
//     tanggal: string;
//     omzet: number;
//   }[];
//   detail_minggu: {
//     tanggal: string;
//     omzet: number;
//   }[];
//   detail_bulan: {
//     tanggal: string;
//     omzet: number;
//   }[];
// }

// interface OmzetSummaryProps {
//   omzetData: OmzetData | null;
//   formatRupiah: (amount: number) => string;
// }

// const OmzetSummary: React.FC<OmzetSummaryProps> = ({ omzetData, formatRupiah }) => {
//   // Hitung rata-rata omzet per hari
//   const averageDaily = omzetData ? 
//     (omzetData.minggu_ini / 7) : 0;
  
//   // Hitung rata-rata omzet per minggu
//   const averageWeekly = omzetData ? 
//     (omzetData.bulan_ini / 4) : 0;
  
//   // Prediksi omzet bulan depan
//   const nextMonthPrediction = omzetData ? 
//     (omzetData.bulan_ini * 1.1) : 0; // Asumsi 10% pertumbuhan
  
//   // Dapatkan hari dengan omzet tertinggi
//   const getBestDay = () => {
//     if (!omzetData || !omzetData.detail_minggu || omzetData.detail_minggu.length === 0) {
//       return { day: 'N/A', amount: 0 };
//     }
    
//     const bestDay = omzetData.detail_minggu.reduce((max, day) => 
//       day.omzet > max.omzet ? day : max, omzetData.detail_minggu[0]);
    
//     return { day: bestDay.tanggal, amount: bestDay.omzet };
//   };
  
//   const bestDay = getBestDay();
  
//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//       <div className="p-6 border-b border-gray-200">
//         <h2 className="text-lg font-semibold text-gray-800">Ringkasan Omzet</h2>
//         <p className="text-sm text-gray-600">Analisis dan prediksi performa omzet</p>
//       </div>
      
//       <div className="p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* Rata-rata Harian */}
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
//               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
//               </svg>
//             </div>
//             <h3 className="text-sm font-medium text-gray-500">Rata-rata Harian</h3>
//             <p className="text-xl font-bold text-gray-900 mt-1">
//               {formatRupiah(averageDaily)}
//             </p>
//           </div>
          
//           {/* Rata-rata Mingguan */}
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
//               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <h3 className="text-sm font-medium text-gray-500">Rata-rata Mingguan</h3>
//             <p className="text-xl font-bold text-gray-900 mt-1">
//               {formatRupiah(averageWeekly)}
//             </p>
//           </div>
          
//           {/* Hari Terbaik */}
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
//               <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//               </svg>
//             </div>
//             <h3 className="text-sm font-medium text-gray-500">Hari Terbaik</h3>
//             <p className="text-xl font-bold text-gray-900 mt-1">
//               {bestDay.day}
//             </p>
//             <p className="text-sm text-gray-500">
//               {formatRupiah(bestDay.amount)}
//             </p>
//           </div>
          
//           {/* Prediksi Bulan Depan */}
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
//               <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <h3 className="text-sm font-medium text-gray-500">Prediksi Bulan Depan</h3>
//             <p className="text-xl font-bold text-gray-900 mt-1">
//               {formatRupiah(nextMonthPrediction)}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               (+10% dari bulan ini)
//             </p>
//           </div>
//         </div>
        
//         {/* Analisis Tambahan */}
//         <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//           <h3 className="text-sm font-medium text-gray-700 mb-2">Analisis Performa</h3>
//           <div className="space-y-2">
//             <div className="flex items-center">
//               <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//               <p className="text-sm text-gray-600">
//                 Omzet harian rata-rata: <span className="font-medium">{formatRupiah(averageDaily)}</span>
//               </p>
//             </div>
//             <div className="flex items-center">
//               <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
//               <p className="text-sm text-gray-600">
//                 Hari dengan omzet tertinggi: <span className="font-medium">{bestDay.day} ({formatRupiah(bestDay.amount)})</span>
//               </p>
//             </div>
//             <div className="flex items-center">
//               <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
//               <p className="text-sm text-gray-600">
//                 Prediksi pertumbuhan bulan depan: <span className="font-medium">+10%</span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OmzetSummary;