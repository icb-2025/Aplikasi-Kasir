// src/meneger/settings/PaymentSettings.tsx
import type { PaymentMethod, PaymentChannel } from './index';

interface PaymentSettingsProps {
  payment_methods: PaymentMethod[];
}

// Fungsi untuk mendapatkan ikon berdasarkan nama metode pembayaran
const getPaymentIcon = (methodName: string) => {
  const name = methodName.toLowerCase();
  
  if (name.includes('tunai') || name.includes('cash')) {
    return (
      <div className="bg-green-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    );
  } else if (name.includes('transfer') || name.includes('bank')) {
    return (
      <div className="bg-blue-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 2 0 00-3-3H6a3 2 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    );
  } else if (name.includes('e-wallet') || name.includes('wallet') || name.includes('dana') || name.includes('ovo') || name.includes('gopay') || name.includes('shopeepay') || name.includes('linkaja')) {
    return (
      <div className="bg-purple-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  } else if (name.includes('kartu') || name.includes('debit') || name.includes('credit') || name.includes('visa') || name.includes('mastercard')) {
    return (
      <div className="bg-indigo-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 2 0 00-3-3H6a3 2 0 00-3 3v8a3 2 0 003 3z" />
        </svg>
      </div>
    );
  } else if (name.includes('qris') || name.includes('qr')) {
    return (
      <div className="bg-blue-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </div>
    );
  } else if (name.includes('virtual') || name.includes('va')) {
    return (
      <div className="bg-cyan-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    );
  } else {
    // Default icon
    return (
      <div className="bg-gray-100 p-3 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 2 0 00-3-3H6a3 2 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    );
  }
};

// Fungsi untuk mendapatkan ikon saluran pembayaran
const getChannelIcon = (channelName: string) => {
  const name = channelName.toLowerCase();
  
  if (name.includes('bca')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">BCA</span>
    );
  } else if (name.includes('bri')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">BRI</span>
    );
  } else if (name.includes('mandiri')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">MDR</span>
    );
  } else if (name.includes('bni')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-800 text-sm font-bold">BNI</span>
    );
  } else if (name.includes('cimb')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-800 text-sm font-bold">CIMB</span>
    );
  } else if (name.includes('permata')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-800 text-sm font-bold">PRMT</span>
    );
  } else if (name.includes('dana')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">DANA</span>
    );
  } else if (name.includes('ovo')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-800 text-sm font-bold">OVO</span>
    );
  } else if (name.includes('gopay')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">GO</span>
    );
  } else if (name.includes('shopee')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-800 text-sm font-bold">SP</span>
    );
  } else if (name.includes('linkaja')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-800 text-sm font-bold">LA</span>
    );
  } else if (name.includes('visa')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">V</span>
    );
  } else if (name.includes('master')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-800 text-sm font-bold">MC</span>
    );
  } else if (name.includes('jcb')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 text-sm font-bold">JCB</span>
    );
  } else if (name.includes('amex')) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">AX</span>
    );
  } else {
    // Default icon
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    );
  }
};

export default function PaymentSettings({
  payment_methods
}: PaymentSettingsProps) {
  return (
    <div className="p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Metode Pembayaran</h2>
        <p className="text-gray-600">Berikut adalah daftar metode pembayaran yang tersedia</p>
      </div>
      
      <div className="space-y-6">
        {payment_methods.map((method, methodIndex) => {
          const isQris = method.method.toLowerCase().includes('qris') || method.method.toLowerCase().includes('qr');
          
          return (
            <div key={method._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="mr-4">
                    {getPaymentIcon(method.method)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {method.method || `Metode Pembayaran #${methodIndex + 1}`}
                  </h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Metode Pembayaran</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getPaymentIcon(method.method)}
                    </div>
                    <input
                      type="text"
                      value={method.method}
                      readOnly
                      className="pl-16 w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
                
                {isQris ? (
                  // Tampilan khusus untuk QRIS - menampilkan logo metode
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo Metode</label>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {method.logo ? (
                        <img 
                          src={method.logo} 
                          alt={method.method} 
                          className="h-16 w-16 object-contain mr-4"
                        />
                      ) : (
                        <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mr-4">
                          <span className="text-gray-400 text-xs">No Logo</span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="font-medium text-gray-800">{method.method}</div>
                        <div className="text-xs text-gray-500">Metode pembayaran QRIS</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Tampilan normal untuk metode lain - menampilkan saluran pembayaran
                  <div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700">Saluran Pembayaran</label>
                      <span className="text-xs text-gray-500 ml-2">({method.channels.length} saluran)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {method.channels.map((channel: PaymentChannel, channelIndex: number) => (
                        <div key={channel._id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="mr-3">
                            {channel.logo ? (
                              <img 
                                src={channel.logo} 
                                alt={channel.name} 
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              getChannelIcon(channel.name)
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium text-gray-800">{channel.name}</div>
                            <div className="text-xs text-gray-500">Saluran #{channelIndex + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {method.channels.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3,1.732 3z" />
                        </svg>
                        <p className="text-gray-500">Belum ada saluran pembayaran</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {payment_methods.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 2 0 00-3-3H6a3 2 0 00-3 3v8a3 2 0 003 3z" />
            </svg>
            <p className="text-gray-500 text-lg">Belum ada metode pembayaran</p>
            <p className="text-gray-400 mt-2">Silakan tambahkan metode pembayaran terlebih dahulu</p>
          </div>
        )}
      </div>
    </div>
  );
}