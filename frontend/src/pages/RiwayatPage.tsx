// import React, { useState, useEffect } from 'react';
// import MainLayout from '../components/MainLayout';
// import Sidebar from './componentUtama/Sidebar';
// import { customStyles } from './CssHalamanUtama';
// import { 
//   FileText, 
//   Eye, 
//   RefreshCw, 
//   Calendar,
//   CreditCard,
//   CheckCircle,
//   Clock,
//   XCircle,
//   X,
//   Printer
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import type { Variants } from 'framer-motion';

// // Tambahkan interface untuk transaksi
// interface TransactionItem {
//   kode_barang: string;
//   nama_barang: string;
//   jumlah: number;
//   harga_satuan: number;
//   harga_beli: number;
//   subtotal: number;
//   _id: string;
// }

// interface Transaction {
//   order_id: string;
//   nama_barang: TransactionItem[];
//   status: string;
//   metode_pembayaran: string;
//   total_harga: number;
//   createdAt: string;
//   kasir_id?: string; // Tambahkan kasir_id ke interface
// }

// interface Kasir {
//   _id: string;
//   nama: string;
//   username: string;
//   email: string;
//   role: string;
// }

// const RiwayatPage: React.FC = () => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
//   const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
//   const [kasir, setKasir] = useState<Kasir | null>(null);
  
//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
//   const refreshTransactions = () => setRefreshKey(prev => prev + 1);

//   // Fetch kasir data by ID
//   const fetchKasirById = async (kasirId: string) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://192.168.110.16:5000/api/kasir/${kasirId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const kasirData = await response.json();
//         return kasirData;
//       }
//       return null;
//     } catch (err) {
//       console.error("Gagal fetch data kasir:", err);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch('http://192.168.110.16:5000/api/users/history', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
        
//         if (!response.ok) throw new Error('Failed to fetch transactions');
//         const data = await response.json();
//         console.log("Data transaksi dari API:", data); // Debugging
//         setTransactions(data.riwayat || []);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchTransactions();
//   }, [refreshKey]);

//   // Fungsi untuk format tanggal (sama dengan di StatusPesananPage)
//   const formatTanggal = (dateString: string) => {
//     try {
//       const options: Intl.DateTimeFormatOptions = { 
//         weekday: 'short', 
//         year: 'numeric', 
//         month: 'short', 
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       };
//       return new Date(dateString).toLocaleDateString('id-ID', options);
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return dateString;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'selesai': case 'success': case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'failed': case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'selesai': case 'success': case 'completed':
//         return <CheckCircle className="w-4 h-4" />;
//       case 'pending':
//         return <Clock className="w-4 h-4" />;
//       case 'failed': case 'cancelled':
//         return <XCircle className="w-4 h-4" />;
//       default:
//         return <Clock className="w-4 h-4" />;
//     }
//   };

//   const handleViewReceipt = async (transaction: Transaction) => {
//     console.log("Transaksi yang dipilih:", transaction); // Debugging
    
//     // Fetch kasir data when viewing receipt
//     if (transaction.kasir_id) {
//       const kasirData = await fetchKasirById(transaction.kasir_id);
//       setKasir(kasirData);
//     } else {
//       setKasir(null);
//     }
    
//     setSelectedTransaction(transaction);
//     setIsReceiptModalOpen(true);
//   };

//   const handlePrintReceipt = async () => {
//     // Fetch kasir data before printing if not already fetched
//     if (selectedTransaction && selectedTransaction.kasir_id && !kasir) {
//       const kasirData = await fetchKasirById(selectedTransaction.kasir_id);
//       setKasir(kasirData);
//     }
//     window.print();
//   };

//   const formatCurrency = (value: number | undefined | null): string => {
//     if (!value || isNaN(value)) return "Rp 0";
//     return `Rp ${value.toLocaleString("id-ID")}`;
//   };

//   // Animasi variants
//   const backdropVariants: Variants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1 },
//   };

//   const modalVariants: Variants = {
//     hidden: { opacity: 0, scale: 0.9, y: 20 },
//     visible: {
//       opacity: 1,
//       scale: 1,
//       y: 0,
//       transition: {
//         duration: 0.3,
//         ease: "easeOut" as const
//       }
//     },
//     exit: {
//       opacity: 0,
//       scale: 0.9,
//       y: 20,
//       transition: {
//         duration: 0.2,
//         ease: "easeIn" as const
//       }
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="bg-white shadow-md rounded-b-xl">
//         <div className="max-w-8x4 mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <button onClick={toggleSidebar} className="md:hidden mr-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>
              
//               <div className="flex-shrink-0 flex items-center">
//                 <div className="bg-amber-500 p-2 rounded-xl shadow-md">
//                   <span className="text-white text-xl font-bold">K+</span>
//                 </div>
//                 <div className="ml-3">
//                   <h1 className="text-xl font-bold text-gray-900">KasirPlus</h1>
//                   <p className="text-xs text-gray-500">Point of Sale System</p>
//                 </div>
//               </div>
              
//               <div className="hidden md:ml-10 md:flex md:items-center">
//                 <nav className="flex" aria-label="Breadcrumb">
//                   <ol className="inline-flex items-center space-x-1 md:space-x-3">
//                     <li className="inline-flex items-center" key="breadcrumb-home">
//                       <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-amber-600">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                         </svg>
//                         Dashboard
//                       </a>
//                     </li>
//                     <li key="breadcrumb-history">
//                       <div className="flex items-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                         <span className="ml-1 text-sm font-medium text-gray-500">History</span>
//                       </div>
//                     </li>
//                   </ol>
//                 </nav>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex h-[calc(100vh-120px)] mt-4 gap-4">
//         <div className="w-64 bg-white rounded-2xl shadow-md overflow-hidden">
//           <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
//         </div>
        
//         <div className="flex-1 bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
//               <p className="text-gray-600">Lihat semua transaksi yang telah dilakukan</p>
//             </div>
//             <button onClick={refreshTransactions} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center">
//               <RefreshCw className="h-5 w-5 mr-1" />
//               Refresh
//             </button>
//           </div>
          
//           {isLoading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//               <p className="text-red-700">{error}</p>
//             </div>
//           ) : transactions.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">📝</div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Transaksi</h3>
//               <p className="text-gray-500">Riwayat transaksi Anda akan muncul di sini</p>
//             </div>
//           ) : (
//             <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr key="table-header">
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode Pembayaran</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {transactions.map((transaction) => (
//                     <tr key={transaction.order_id} className="hover:bg-gray-50 transition-colors duration-150">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-700">
//                           <Calendar className="h-4 w-4 mr-2 text-gray-400" />
//                           <div>
//                             <div>{formatTanggal(transaction.createdAt).split(',')[0]}</div>
//                             <div className="text-xs text-gray-500">{formatTanggal(transaction.createdAt).split(',')[1]}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900 max-w-xs">
//                           {transaction.nama_barang && transaction.nama_barang.length > 0 ? (
//                             <div className="space-y-1">
//                               {transaction.nama_barang.slice(0, 2).map((item, index) => (
//                                 <div key={`${transaction.order_id}-item-${index}`} className="flex justify-between">
//                                   <span className="font-medium">{item.nama_barang}</span>
//                                   <span className="text-gray-500 text-xs">
//                                     {item.jumlah} x {formatCurrency(item.harga_satuan)}
//                                   </span>
//                                 </div>
//                               ))}
//                               {transaction.nama_barang.length > 2 && (
//                                 <div className="text-xs text-gray-500 italic">
//                                   +{transaction.nama_barang.length - 2} item lainnya
//                                 </div>
//                               )}
//                             </div>
//                           ) : (
//                             <div className="text-gray-500 text-sm">Tidak ada item</div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-semibold text-gray-900">
//                           {formatCurrency(transaction.total_harga)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-700">
//                           <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
//                           {transaction.metode_pembayaran}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
//                           <div className="flex items-center">
//                             {getStatusIcon(transaction.status)}
//                             <span className="ml-1 capitalize">{transaction.status}</span>
//                           </div>
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex space-x-2">
//                           <button 
//                             onClick={() => handleViewReceipt(transaction)}
//                             className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center transition-colors"
//                             title="Lihat Struk"
//                           >
//                             <Eye className="h-4 w-4 mr-1" />
//                             <span>Lihat</span>
//                           </button>
//                           <button 
//                             onClick={async () => {
//                               setSelectedTransaction(transaction);
//                               // Fetch kasir data before printing
//                               if (transaction.kasir_id) {
//                                 const kasirData = await fetchKasirById(transaction.kasir_id);
//                                 setKasir(kasirData);
//                               } else {
//                                 setKasir(null);
//                               }
//                               handlePrintReceipt();
//                             }}
//                             className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center transition-colors"
//                             title="Cetak Struk"
//                           >
//                             <Printer className="h-4 w-4 mr-1" />
//                             <span>Cetak</span>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal untuk menampilkan struk - SAMA DENGAN STATUS PESANAN */}
//       <AnimatePresence>
//         {isReceiptModalOpen && selectedTransaction && (
//           <>
//             <motion.div
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
//               variants={backdropVariants}
//               initial="hidden"
//               animate="visible"
//               exit="hidden"
//               onClick={() => setIsReceiptModalOpen(false)}
//             />
            
//             <motion.div
//               className="fixed inset-0 flex items-center justify-center z-50 p-4"
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//             >
//               <div 
//                 className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
//                         <FileText className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <h1 className="text-2xl font-bold">Struk Pesanan</h1>
//                         <p className="text-green-100 text-sm">Detail pesanan Anda</p>
//                       </div>
//                     </div>
//                     <button 
//                       onClick={() => setIsReceiptModalOpen(false)}
//                       className="p-2 rounded-full hover:bg-white/20 transition-colors"
//                     >
//                       <X className="w-6 h-6" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6">
//                   <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 print:w-full print:shadow-none print:mt-0">
//                     <h2 className="text-xl font-bold text-center mb-2">STRUK PEMBELIAN</h2>
//                     <p className="text-center text-sm text-gray-600 mb-4">
//                       #{selectedTransaction.order_id}
//                     </p>

//                     <div className="border-t border-b py-2 mb-4 text-sm">
//                       <p>
//                         <span className="font-semibold">Tanggal:</span>{" "}
//                         {formatTanggal(selectedTransaction.createdAt)}
//                       </p>
//                       <p>
//                         <span className="font-semibold">Metode:</span>{" "}
//                         {selectedTransaction.metode_pembayaran || "-"}
//                       </p>
//                       <p>
//                         <span className="font-semibold">Kasir:</span>{" "}
//                         {kasir ? kasir.nama : selectedTransaction.kasir_id || "-"}
//                       </p>
//                       <p>
//                         <span className="font-semibold">Status:</span>{" "}
//                         <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTransaction.status)}`}>
//                           {selectedTransaction.status}
//                         </span>
//                       </p>
//                     </div>

//                     <table className="w-full text-sm mb-4">
//                       <thead className="border-b">
//                         <tr>
//                           <th className="text-left py-1">Barang</th>
//                           <th className="text-center py-1">Qty</th>
//                           <th className="text-right py-1">Harga</th>
//                           <th className="text-right py-1">Subtotal</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {selectedTransaction.nama_barang && selectedTransaction.nama_barang.length > 0 ? (
//                           selectedTransaction.nama_barang.map((item: TransactionItem, idx: number) => (
//                             <tr key={`${selectedTransaction.order_id}-receipt-item-${idx}`} className="border-b">
//                               <td className="py-1">{item.nama_barang}</td>
//                               <td className="py-1 text-center">{item.jumlah}</td>
//                               <td className="py-1 text-right">
//                                 {formatCurrency(item.harga_satuan)}
//                               </td>
//                               <td className="py-1 text-right">
//                                 {formatCurrency(item.subtotal)}
//                               </td>
//                             </tr>
//                           ))
//                         ) : (
//                           <tr key="no-items">
//                             <td colSpan={4} className="py-2 text-center text-gray-500">
//                               Tidak ada data barang
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>

//                     <div className="flex justify-between items-center text-lg font-bold mb-6">
//                       <span>Total</span>
//                       <span className="text-green-600">
//                         {formatCurrency(selectedTransaction.total_harga)}
//                       </span>
//                     </div>

//                     <div className="flex gap-3 mt-6 print:hidden">
//                       <button
//                         onClick={() => setIsReceiptModalOpen(false)}
//                         className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
//                       >
//                         Tutup
//                       </button>
//                       <button
//                         onClick={handlePrintReceipt}
//                         className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
//                       >
//                         Cetak Struk
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
      
//       <style>{customStyles}</style>
//     </MainLayout>
//   );
// };

// export default RiwayatPage;