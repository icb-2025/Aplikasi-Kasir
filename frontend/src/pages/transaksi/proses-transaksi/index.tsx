// // src/pages/transaksi/proses-transaksi/index.tsx
// import { useEffect, useState, useCallback } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import MainLayout from "../../../components/MainLayout";
// import PaymentInfo from "./components/PaymentInfo";
// import PurchaseDetails from "./components/PurchaseDetails";
// import SweetAlert from "../../../components/SweetAlert";

// // Define interfaces
// interface BarangDibeli {
//   kode_barang: string;
//   nama_barang: string;
//   jumlah: number;
//   harga_satuan: number;
//   harga_beli: number;
//   subtotal: number;
//   _id: string;
//   gambar_url?: string;
// }

// interface TransactionResponse {
//   _id: string;
//   order_id: string;
//   nomor_transaksi: string;
//   tanggal_transaksi: string;
//   barang_dibeli: BarangDibeli[];
//   total_harga: number;
//   metode_pembayaran: string;
//   status: string;
//   kasir_id?: string;
//   createdAt: string;
//   updatedAt: string;
//   no_va?: string;
// }

// interface MidtransData {
//   transaction_id?: string;
//   order_id: string;
//   gross_amount: string;
//   payment_type: string;
//   transaction_status: string;
//   qr_string?: string;
//   permata_va_number?: string;
//   va_number?: string;
//   actions?: Array<{
//     name: string;
//     method: string;
//     url: string;
//   }>;
// }

// const ProsesTransaksiPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { token } = useParams<{ token: string }>();
  
//   const [paymentStatus, setPaymentStatus] = useState<'pending' | 'selesai' | 'deny' | 'cancel' | 'expire'>('pending');
//   const [isPaymentSuccess, setIsPaymentSuccess] = useState<boolean>(false);
//   const [isExpired, setIsExpired] = useState<boolean>(false);
//   const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
//   const [isCancelling, setIsCancelling] = useState<boolean>(false);
//   const [timeLeft, setTimeLeft] = useState<number>(300); // 5 menit dalam detik
//   const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
//   const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(true);
//   const [qrCodeError, setQrCodeError] = useState<boolean>(false);
//   const [paymentType, setPaymentType] = useState<'va' | 'qris' | 'ewallet' | 'tunai' | null>(null);
//   const [isInitialized, setIsInitialized] = useState<boolean>(false);
//   const [parsedOrderId, setParsedOrderId] = useState<string | null>(null);
//   const [parsedTransactionStatus, setParsedTransactionStatus] = useState<string | null>(null);
//   const [parsedStatusCode, setParsedStatusCode] = useState<string | null>(null);
  
//   const { 
//     transaksi = null,
//     midtrans = null,
//     expiryTime
//   } = (location.state as { 
//     expiryTime?: string;
//     transaksi?: TransactionResponse | null;
//     midtrans?: MidtransData | null;
//   }) || {};

//   // Generate unique key for localStorage based on transaction ID
//   const getStorageKey = useCallback((suffix: string) => {
//     const orderId = transaksi?.order_id || midtrans?.order_id || token;
//     return `transaksi_${orderId}_${suffix}`;
//   }, [transaksi, midtrans, token]);

//   // Initialize timer from localStorage or calculate remaining time
//   useEffect(() => {
//     if (!transaksi || !midtrans || isInitialized) return;
    
//     const orderId = transaksi?.order_id || midtrans?.order_id;
//     if (!orderId) return;
    
//     // Check if transaction is already marked as expired
//     const expiredKey = getStorageKey('expired');
//     const isExpiredStored = localStorage.getItem(expiredKey) === 'true';
    
//     if (isExpiredStored) {
//       setIsExpired(true);
//       setIsInitialized(true);
//       return;
//     }
    
//     // Check if payment is already completed
//     const successKey = getStorageKey('success');
//     const isSuccessStored = localStorage.getItem(successKey) === 'true';
    
//     if (isSuccessStored) {
//       setIsPaymentSuccess(true);
//       setIsInitialized(true);
//       return;
//     }
    
//     // Calculate remaining time
//     let remainingTime = 300; // Default 5 minutes
    
//     if (expiryTime) {
//       const expiryDate = new Date(expiryTime);
//       const now = new Date();
//       const diffInSeconds = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);
      
//       if (diffInSeconds <= 0) {
//         // Transaction already expired
//         localStorage.setItem(expiredKey, 'true');
//         setIsExpired(true);
//         setIsInitialized(true);
//         return;
//       }
      
//       remainingTime = Math.min(diffInSeconds, 300); // Cap at 5 minutes
//     } else {
//       // Try to get remaining time from localStorage
//       const timeKey = getStorageKey('timeLeft');
//       const storedTime = localStorage.getItem(timeKey);
      
//       if (storedTime) {
//         const parsedTime = parseInt(storedTime, 10);
//         if (!isNaN(parsedTime) && parsedTime > 0) {
//           remainingTime = parsedTime;
//         }
//       }
//     }
    
//     setTimeLeft(remainingTime);
//     setIsInitialized(true);
//   }, [transaksi, midtrans, expiryTime, token, isInitialized, getStorageKey]);

//   // Save timer to localStorage and handle expiration
//   useEffect(() => {
//     if (!isInitialized || isExpired || isPaymentSuccess) return;
    
//     if (timeLeft <= 0) {
//       // Mark transaction as expired
//       const expiredKey = getStorageKey('expired');
//       localStorage.setItem(expiredKey, 'true');
//       setIsExpired(true);
//       return;
//     }
    
//     // Save remaining time to localStorage
//     const timeKey = getStorageKey('timeLeft');
//     localStorage.setItem(timeKey, timeLeft.toString());
    
//     const timerId = setTimeout(() => {
//       setTimeLeft(timeLeft - 1);
//     }, 1000);
    
//     return () => clearTimeout(timerId);
//   }, [timeLeft, isInitialized, isExpired, isPaymentSuccess, getStorageKey]);

//   // Cleanup localStorage when transaction is completed or cancelled
//   useEffect(() => {
//     if (isPaymentSuccess || isExpired) {
//       const orderId = transaksi?.order_id || midtrans?.order_id || token;
//       if (!orderId) return;
      
//       // Save completion status
//       if (isPaymentSuccess) {
//         const successKey = getStorageKey('success');
//         localStorage.setItem(successKey, 'true');
//       }
      
//       // Clean up timer data
//       const timeKey = getStorageKey('timeLeft');
//       localStorage.removeItem(timeKey);
//     }
//   }, [isPaymentSuccess, isExpired, transaksi, midtrans, token, getStorageKey]);

//   // Debugging: Cek token dan transaksi
//   useEffect(() => {
//     console.log("Token dari URL:", token);
//     console.log("Data transaksi dari state:", transaksi);
//     console.log("Data midtrans dari state:", midtrans);
    
//     // Tentukan jenis pembayaran berdasarkan data
//     if (transaksi && midtrans) {
//       if (transaksi.metode_pembayaran?.includes('Virtual Account') || midtrans.payment_type === 'bank_transfer') {
//         setPaymentType('va');
//       } else if (transaksi.metode_pembayaran?.includes('QRIS') || midtrans.payment_type === 'qris') {
//         setPaymentType('qris');
//       } else if (transaksi.metode_pembayaran?.includes('E-Wallet') || 
//                 ['gopay', 'shopeepay', 'dana', 'ovo', 'linkaja'].includes(midtrans.payment_type || '')) {
//         setPaymentType('ewallet');
//       } else if (transaksi.metode_pembayaran?.includes('Tunai') || midtrans.payment_type === 'cstore') {
//         setPaymentType('tunai');
//       }
//     }
//   }, [token, transaksi, midtrans]);

//   // Fetch QR Code hanya untuk QRIS/E-Wallet
//   useEffect(() => {
//     if (paymentType === 'qris' || paymentType === 'ewallet') {
//       setQrCodeLoading(true);
//       setQrCodeError(false);
      
//       if (midtrans && midtrans.actions && midtrans.actions.length > 0) {
//         const qrAction = midtrans.actions.find(action => action.name === "generate-qr-code-v2") || 
//                         midtrans.actions.find(action => action.name === "generate-qr-code");
        
//         if (qrAction) {
//           setQrCodeUrl(qrAction.url);
//           setQrCodeLoading(false);
//         } else {
//           setQrCodeLoading(false);
//           setQrCodeError(true);
//         }
//       } else {
//         setQrCodeLoading(false);
//         setQrCodeError(true);
//       }
//     } else {
//       setQrCodeLoading(false);
//     }
//   }, [midtrans, paymentType]);

//   // Format waktu untuk ditampilkan
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Cek parameter query untuk status pembayaran dari Midtrans
//   useEffect(() => {
//     // Try several places where Midtrans may put callback params:
//     // 1) location.search (normal query string)
//     // 2) location.hash (some integrations append ?params after hash)
//     // 3) window.location.href as a final fallback
//     const extractSearch = (): string => {
//       if (location.search && location.search.length > 1) return location.search;
//       if (location.hash && location.hash.includes('?')) {
//         return location.hash.slice(location.hash.indexOf('?'));
//       }
//       try {
//         const u = new URL(window.location.href);
//         return u.search || '';
//       } catch (err) {
//         console.warn('Failed to parse window.location.href', err);
//         return '';
//       }
//     };

//     const raw = extractSearch();
//     const qp = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);

//     // Midtrans may use 'status' or 'status_code' for the numeric status — check both
//     const statusCode = qp.get('status') ?? qp.get('status_code');
//     const transactionStatus = qp.get('transaction_status') ?? qp.get('transactionStatus');
//     const orderId = qp.get('order_id') ?? qp.get('orderId');

//     console.log('Parsed Midtrans params from URL ->', { statusCode, transactionStatus, orderId });

//     // persist parsed values for button fallback
//     setParsedOrderId(orderId);
//     setParsedTransactionStatus(transactionStatus);
//     setParsedStatusCode(statusCode);

//     // If params indicate success/failed, immediately navigate as before
//     if (statusCode === '200' && (transactionStatus === 'settlement' || transactionStatus === 'capture') && orderId) {
//       setIsPaymentSuccess(true);
//       setTimeout(() => {
//         navigate(`/pembelian-berhasil/${token}`, {
//           state: { transaksiId: orderId, transaksiTerbaru: transaksi, status: 'success', message: 'Pembayaran berhasil!' },
//           replace: true
//         });
//       }, 1500);
//       return;
//     }

//     if ((statusCode === '202' || transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') && orderId) {
//       setTimeout(() => {
//         navigate('/pembelian-gagal', {
//           state: { transaksiId: orderId, transaksiTerbaru: transaksi, status: 'failed', message: 'Pembayaran gagal. Silakan coba lagi.' },
//           replace: true
//         });
//       }, 1500);
//       return;
//     }
//   }, [location.search, location.hash, navigate, token, transaksi]);

//   // Fungsi untuk mengecek status transaksi ke API
//   const checkTransactionStatus = async (orderId: string) => {
//     setIsCheckingStatus(true);
//     try {
//       console.log(`Mengecek status transaksi untuk order ID: ${orderId}`);
//       // Build API base and headers (reuse Vite env keys if available)
//       const meta = import.meta as { env?: { VITE_API_BASE_URL?: string; VITE_API_KEY?: string } };
//       const API_BASE = meta.env?.VITE_API_BASE_URL ?? '';
//       const API_KEY = meta.env?.VITE_API_KEY ?? '';

//       const tokenLocal = localStorage.getItem('token');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json'
//       };
//       if (API_KEY) headers['x-api-key'] = API_KEY;
//       if (tokenLocal) headers['Authorization'] = `Bearer ${tokenLocal}`;

//       const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/api/transaksi/public/status/${orderId}` : `/api/transaksi/public/status/${orderId}`;
//       const response = await fetch(url, { headers });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("Respons dari API:", data);
      
//       // Update status berdasarkan respons dari API
//       if (data.status === 'settlement' || data.status === 'selesai') {
//         console.log("Pembayaran berhasil, mengarahkan ke halaman pembelian berhasil");
//         setIsPaymentSuccess(true);
        
//         setTimeout(() => {
//           navigate(`/pembelian-berhasil/${token}`, {
//             state: { 
//               transaksiId: orderId,
//               transaksiTerbaru: transaksi,
//               status: 'success',
//               message: "Pembayaran berhasil!" 
//             },
//             replace: true
//           });
//         }, 1500);
//       } else if (data.status === 'pending') {
//         console.log("Status pembayaran masih pending");
//         setPaymentStatus('pending');
//         await SweetAlert.fire({
//           title: 'Pembayaran Pending',
//           text: 'Pembayaran masih dalam proses. Silakan coba lagi beberapa saat.',
//           icon: 'info',
//           confirmButtonText: 'OK'
//         });
//       } else if (data.status === 'expire') {
//         console.log("Pembayaran kadaluarsa");
//         setPaymentStatus('expire');
//         setIsExpired(true);
//         await SweetAlert.fire({
//           title: 'Pembayaran Kadaluarsa',
//           text: 'Waktu pembayaran telah habis. Silakan coba lagi.',
//           icon: 'warning',
//           confirmButtonText: 'OK'
//         });
//       } else if (data.status === 'deny' || data.status === 'cancel') {
//         console.log("Pembayaran gagal atau dibatalkan");
//         setPaymentStatus(data.status);
//         await SweetAlert.fire({
//           title: 'Pembayaran Gagal',
//           text: 'Pembayaran gagal atau dibatalkan. Silakan coba lagi.',
//           icon: 'error',
//           confirmButtonText: 'OK'
//         });
//       } else {
//         console.log("Status tidak dikenal:", data.status);
//         await SweetAlert.fire({
//           title: 'Status Pembayaran',
//           text: `Status pembayaran: ${data.status}`,
//           icon: 'info',
//           confirmButtonText: 'OK'
//         });
//       }
//     } catch (error) {
//       console.error("Error saat mengecek status transaksi:", error);
//       await SweetAlert.fire({
//         title: 'Error',
//         text: 'Terjadi kesalahan saat mengecek status pembayaran. Silakan coba lagi.',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     } finally {
//       setIsCheckingStatus(false);
//     }
//   };

//   // Fungsi untuk membatalkan transaksi
//   const cancelTransaction = async (transactionId: string) => {
//     setIsCancelling(true);
//     try {
//       console.log(`Membatalkan transaksi dengan ID: ${transactionId}`);
//       const meta = import.meta as { env?: { VITE_API_BASE_URL?: string; VITE_API_KEY?: string } };
//       const API_BASE = meta.env?.VITE_API_BASE_URL ?? '';
//       const API_KEY = meta.env?.VITE_API_KEY ?? '';
//       const tokenLocal = localStorage.getItem('token');
//       const headers: Record<string, string> = {
//         'Content-Type': 'application/json'
//       };
//       if (API_KEY) headers['x-api-key'] = API_KEY;
//       if (tokenLocal) headers['Authorization'] = `Bearer ${tokenLocal}`;

//       const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/api/transaksi/cancel/${transactionId}` : `/api/transaksi/cancel/${transactionId}`;
//       const response = await fetch(url, {
//         method: 'PUT',
//         headers
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("Respons pembatalan:", data);
      
//       // Tampilkan notifikasi sukses
//       await SweetAlert.fire({
//         title: 'Pembatalan Berhasil',
//         text: 'Transaksi telah berhasil dibatalkan.',
//         icon: 'success',
//         confirmButtonText: 'OK'
//       });
      
//       // Arahkan ke halaman transaksi
//       navigate("/transaksi");
//     } catch (error) {
//       console.error("Error saat membatalkan transaksi:", error);
      
//       // Tampilkan notifikasi error
//       await SweetAlert.fire({
//         title: 'Pembatalan Gagal',
//         text: 'Terjadi kesalahan saat membatalkan transaksi. Silakan coba lagi.',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     } finally {
//       setIsCancelling(false);
//     }
//   };

//   // Fungsi untuk menyalin nomor VA
//   const copyVANumber = (vaNumber: string) => {
//     navigator.clipboard.writeText(vaNumber)
//       .then(() => {
//         SweetAlert.fire({
//           title: 'Berhasil',
//           text: 'Nomor Virtual Account telah disalin!',
//           icon: 'success',
//           timer: 2000,
//           showConfirmButton: false
//         });
//       })
//       .catch(err => {
//         console.error('Gagal menyalin: ', err);
//         SweetAlert.fire({
//           title: 'Error',
//           text: 'Gagal menyalin nomor Virtual Account',
//           icon: 'error',
//           confirmButtonText: 'OK'
//         });
//       });
//   };

//   // Menangani pembayaran dengan Midtrans
//   const handlePaymentWithMidtrans = async () => {
//     console.log("Memproses pembayaran dengan Midtrans");
    
//     // Untuk E-Wallet, cek status ke API
//     console.log("Pembayaran E-Wallet, mengecek status ke API");
//     setPaymentStatus('pending');
    
//     // Ambil order ID untuk mengecek status — coba beberapa fallback
//     const orderId = transaksi?.order_id || midtrans?.order_id || parsedOrderId || token;
//   console.log('Checking status for orderId (fallbacks):', { fromTransaksi: transaksi?.order_id, fromMidtrans: midtrans?.order_id, parsedOrderId, parsedTransactionStatus, parsedStatusCode, token });

//     if (orderId) {
//       await checkTransactionStatus(orderId);
//     } else {
//       console.error("Order ID tidak ditemukan");
//       await SweetAlert.fire({
//         title: 'Error',
//         text: 'Order ID tidak ditemukan. Silakan coba lagi.',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     }
//   };

//   // Menangani pembayaran dibatalkan
//   const handlePaymentCancel = async () => {
//     console.log("Pembayaran dibatalkan");
    
//     // Ambil transaction ID (MongoDB _id) untuk membatalkan transaksi
//     const transactionId = transaksi?._id;
//     if (transactionId) {
//       // Konfirmasi pembatalan dengan SweetAlert
//       const result = await SweetAlert.fire({
//         title: 'Konfirmasi Pembatalan',
//         text: 'Apakah Anda yakin ingin membatalkan transaksi ini?',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#d33',
//         cancelButtonColor: '#3085d6',
//         confirmButtonText: 'Ya, Batalkan',
//         cancelButtonText: 'Tidak'
//       });
      
//       // Jika pengguna mengkonfirmasi pembatalan
//       if (result.isConfirmed) {
//         await cancelTransaction(transactionId);
//       }
//     } else {
//       console.error("Transaction ID tidak ditemukan");
//       await SweetAlert.fire({
//         title: 'Error',
//         text: 'ID transaksi tidak ditemukan. Silakan coba lagi.',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
      
//       // Tetap arahkan ke halaman transaksi meskipun ada error
//       navigate("/transaksi");
//     }
//   };

//   // If transaction is expired, prevent further actions
//   useEffect(() => {
//     if (isExpired) {
//       // Disable any payment processing
//       setPaymentStatus('expire');
      
//       // Show notification if not already shown
//       if (isInitialized) {
//         SweetAlert.fire({
//           title: 'Pembayaran Kadaluarsa',
//           text: 'Waktu pembayaran telah habis. Silakan coba lagi.',
//           icon: 'warning',
//           confirmButtonText: 'OK'
//         });
//       }
//     }
//   }, [isExpired, isInitialized]);

//   // If payment is successful, prevent further actions
//   useEffect(() => {
//     if (isPaymentSuccess) {
//       // Disable any payment processing
//       setPaymentStatus('selesai');
//     }
//   }, [isPaymentSuccess]);

//   // Jika pembayaran berhasil dari Midtrans, tampilkan pesan loading
//   if (isPaymentSuccess) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center items-center h-screen">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//             <p className="mt-4">Memproses pembayaran berhasil...</p>
//             <p className="text-sm text-gray-600 mt-2">Anda akan diarahkan ke halaman pembelian berhasil</p>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Jika transaksi sudah kadaluarsa, tampilkan halaman expired
//   if (isExpired) {
//     return (
//       <MainLayout>
//         <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">Pembayaran Kadaluarsa</h1>
//             <p className="text-gray-600">Waktu pembayaran telah habis</p>
//           </div>

//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//             <div className="text-center">
//               <p className="font-bold">Waktu pembayaran telah habis!</p>
//               <p className="mt-2">Silakan coba lagi atau pilih metode pembayaran lain</p>
//               <button
//                 onClick={() => {
//                   // Clear localStorage for this transaction
//                   const orderId = transaksi?.order_id || midtrans?.order_id || token;
//                   if (orderId) {
//                     localStorage.removeItem(`transaksi_${orderId}_timeLeft`);
//                     localStorage.removeItem(`transaksi_${orderId}_expired`);
//                   }
//                   navigate("/transaksi");
//                 }}
//                 className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//               >
//                 Kembali ke Halaman Transaksi
//               </button>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Ambil nilai dengan aman untuk ditampilkan
//   const getSafeValue = (value: string | number | null | undefined, defaultValue: string = ""): string => {
//     if (value === null || value === undefined) return defaultValue;
//     if (typeof value === 'number') return value.toLocaleString("id-ID");
//     return value;
//   };

//   return (
//     <MainLayout>
//       <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Proses Pembayaran</h1>
//           <p className="text-gray-600">Silakan selesaikan pembayaran Anda</p>
          
//           {/* Timer countdown */}
//           <div className="mt-4 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
//             <p className="text-sm text-yellow-700">Batas waktu pembayaran:</p>
//             <div className={`text-xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-yellow-600'}`}>
//               {formatTime(timeLeft)}
//             </div>
//           </div>
//         </div>

//         {isExpired ? (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//             <div className="text-center">
//               <p className="font-bold">Waktu pembayaran telah habis!</p>
//               <p className="mt-2">Silakan coba lagi atau pilih metode pembayaran lain</p>
//               <button
//                 onClick={handlePaymentCancel}
//                 disabled={isCancelling}
//                 className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
//               >
//                 {isCancelling ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Membatalkan...
//                   </>
//                 ) : (
//                   "Kembali ke Halaman Transaksi"
//                 )}
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             <PaymentInfo 
//               transaksi={transaksi} 
//               paymentStatus={paymentStatus}
//             />
            
//             <PurchaseDetails transaksi={transaksi} />
            
//             {/* Tampilkan informasi pembayaran berdasarkan jenis */}
//             {paymentType === 'va' && transaksi && midtrans && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-blue-800 mb-4">Pembayaran Virtual Account</h3>
                
//                 <div className="bg-white rounded-lg p-4 border border-blue-300">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm text-gray-600">Metode Pembayaran</p>
//                       <p className="font-medium text-lg">
//                         {getSafeValue(transaksi.metode_pembayaran)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Total Pembayaran</p>
//                       <p className="font-medium text-lg">
//                         Rp {getSafeValue(transaksi.total_harga, "0")}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex flex-col items-center">
//                     <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4 w-full max-w-md">
//                       <p className="text-sm text-gray-600 mb-2">Nomor Virtual Account:</p>
//                       <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
//                         <span className="text-xl font-mono font-bold">
//                           {transaksi.no_va || midtrans.permata_va_number || midtrans.va_number || "-"}
//                         </span>
//                         <button
//                           onClick={() => copyVANumber(transaksi.no_va || midtrans.permata_va_number || midtrans.va_number || "")}
//                           className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
//                         >
//                           Salin
//                         </button>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4 text-sm text-gray-600">
//                     <p className="font-medium mb-2">Cara Pembayaran:</p>
//                     <ol className="list-decimal pl-5 space-y-1">
//                       <li>Buka aplikasi mobile banking atau ATM bank Anda</li>
//                       <li>Pilih menu Transfer atau Pembayaran</li>
//                       <li>Pilih menu Virtual Account</li>
//                       <li>Masukkan nomor Virtual Account di atas</li>
//                       <li>Konfirmasi pembayaran dengan jumlah yang benar</li>
//                       <li>Simpan bukti pembayaran Anda</li>
//                     </ol>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {(paymentType === 'qris' || paymentType === 'ewallet') && (
//               <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-purple-800 mb-4">
//                   {paymentType === 'qris' ? 'Pembayaran QRIS' : 'Pembayaran E-Wallet'}
//                 </h3>
                
//                 <div className="bg-white rounded-lg p-4 border border-purple-300">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm text-gray-600">Metode Pembayaran</p>
//                       <p className="font-medium text-lg">
//                         {getSafeValue(transaksi?.metode_pembayaran)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Total Pembayaran</p>
//                       <p className="font-medium text-lg">
//                         Rp {getSafeValue(transaksi?.total_harga, "0")}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="flex flex-col items-center">
//                     {qrCodeLoading ? (
//                       <div className="flex justify-center items-center h-64 w-full">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//                       </div>
//                     ) : qrCodeError ? (
//                       <div className="flex flex-col items-center justify-center h-64 w-full">
//                         <div className="bg-red-100 rounded-full p-4 mb-4">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                           </svg>
//                         </div>
//                         <p className="text-gray-500 text-center">QR Code tidak dapat dimuat. Silakan gunakan URL pembayaran di bawah ini.</p>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
//                           {qrCodeUrl ? (
//                             <img 
//                               src={qrCodeUrl} 
//                               alt="QR Code Pembayaran" 
//                               className="w-64 h-64 object-contain"
//                               onError={() => {
//                                 console.error("Error loading QR Code image");
//                                 setQrCodeError(true);
//                               }}
//                             />
//                           ) : (
//                             <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
//                               <p className="text-gray-500">QR Code tidak tersedia</p>
//                             </div>
//                           )}
//                         </div>
                        
//                         {/* Tampilkan URL pembayaran */}
//                         {qrCodeUrl && (
//                           <div className="mt-4 w-full max-w-md">
//                             <p className="text-sm text-gray-600 mb-1">URL Pembayaran:</p>
//                             <div className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
//                               <a 
//                                 href={qrCodeUrl} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 hover:text-blue-800 break-all"
//                               >
//                                 {qrCodeUrl}
//                               </a>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-2">
//                               Klik URL di atas untuk membuka halaman pembayaran
//                             </p>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
                  
//                   <div className="mt-4 text-sm text-gray-600">
//                     <p className="font-medium mb-2">Cara Pembayaran:</p>
//                     <ol className="list-decimal pl-5 space-y-1">
//                       <li>Buka aplikasi {paymentType === 'qris' ? 'e-wallet atau mobile banking' : 'E-Wallet'} Anda</li>
//                       <li>Pilih menu Bayar atau Scan</li>
//                       <li>Scan QR Code yang ditampilkan di atas atau klik URL pembayaran</li>
//                       <li>Konfirmasi pembayaran dengan jumlah yang benar</li>
//                       <li>Simpan bukti pembayaran Anda</li>
//                     </ol>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {paymentType === 'tunai' && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-green-800 mb-4">Pembayaran Tunai</h3>
                
//                 <div className="bg-white rounded-lg p-4 border border-green-300">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm text-gray-600">Metode Pembayaran</p>
//                       <p className="font-medium text-lg">
//                         {getSafeValue(transaksi?.metode_pembayaran)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Total Pembayaran</p>
//                       <p className="font-medium text-lg">
//                         Rp {getSafeValue(transaksi?.total_harga, "0")}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4 text-sm text-gray-600">
//                     <p className="font-medium mb-2">Cara Pembayaran:</p>
//                     <ol className="list-decimal pl-5 space-y-1">
//                       <li>Silakan bayar langsung di kasir</li>
//                       <li>Menunjukkan nomor transaksi kepada kasir</li>
//                       <li>Simpan bukti pembayaran Anda</li>
//                     </ol>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">Selesaikan Pembayaran</h2>
              
//               <p className="text-gray-600 mb-6">
//                 Setelah melakukan pembayaran, klik tombol 'Cek Status Pembayaran' untuk memverifikasi pembayaran Anda.
//               </p>
              
//               <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
//                 <button
//                   onClick={handlePaymentCancel}
//                   disabled={isCancelling || isCheckingStatus}
//                   className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 flex items-center justify-center"
//                 >
//                   {isCancelling ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Membatalkan...
//                     </>
//                   ) : (
//                     "Batal"
//                   )}
//                 </button>
//                 <button
//                   onClick={handlePaymentWithMidtrans}
//                   disabled={isCheckingStatus || isExpired || isCancelling}
//                   className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
//                 >
//                   {isCheckingStatus ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Mengecek Status...
//                     </>
//                   ) : isExpired ? (
//                     "Waktu Habis"
//                   ) : (
//                     "Cek Status Pembayaran"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// };

// export default ProsesTransaksiPage;
