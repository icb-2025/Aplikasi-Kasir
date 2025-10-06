import React, { useState, useEffect } from 'react';
import SweetAlert from '../../components/SweetAlert';
import LoadingSpinner from '../../components/LoadingSpinner';

// Import components
import Tabs from './components/Tabs';
import GeneralSettings from './components/GeneralSettings';
import ReceiptSettings from './components/ReceiptSettings';
import PaymentSettings from './components/PaymentSettings';
import AdvancedSettings from './components/AdvancedSettings';

interface PaymentChannel {
  name: string;
  _id: string;
  logo?: string;
  isActive: boolean;
}

interface PaymentMethod {
  method: string;
  channels: PaymentChannel[];
  _id: string;
  isActive: boolean;
}

interface FormData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogo: string;
  receiptHeader: string;
  receiptFooter: string;
  taxRate: number;
  globalDiscount: number;
  serviceCharge: number;
  lowStockAlert: number;
  currency: string;
  dateFormat: string;
  language: string;
  showBarcode: boolean;
  showCashierName: boolean;
  paymentMethods: string[];
  payment_methods: PaymentMethod[];
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null);
  const [channelLogoFiles, setChannelLogoFiles] = useState<Record<string, File>>({});
  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    storeAddress: '',
    storePhone: '',
    storeLogo: '',
    receiptHeader: '',
    receiptFooter: '',
    taxRate: 0,
    globalDiscount: 0,
    serviceCharge: 0,
    lowStockAlert: 0,
    currency: 'IDR',
    dateFormat: 'DD/MM/YYYY',
    language: 'eng',
    showBarcode: false,
    showCashierName: true,
    paymentMethods: [],
    payment_methods: [],
  });

  const BASE_API_URL = 'http://192.168.110.16:5000/api/admin/settings';

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_API_URL);
      if (!response.ok) {
        throw new Error('Gagal mengambil data pengaturan');
      }
      const data = await response.json();
      
      setFormData({
        storeName: data.storeName,
        storeAddress: data.storeAddress,
        storePhone: data.storePhone,
        storeLogo: data.storeLogo,
        receiptHeader: data.receiptHeader,
        receiptFooter: data.receiptFooter,
        taxRate: data.taxRate,
        globalDiscount: data.globalDiscount,
        serviceCharge: data.serviceCharge,
        lowStockAlert: data.lowStockAlert,
        currency: data.currency,
        dateFormat: data.dateFormat,
        language: data.language,
        showBarcode: data.showBarcode,
        showCashierName: data.showCashierName,
        paymentMethods: data.paymentMethods,
        payment_methods: data.payment_methods,
      });
    } catch (error) {
      SweetAlert.error('Gagal memuat data pengaturan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'taxRate' || name === 'globalDiscount' || name === 'serviceCharge' || name === 'lowStockAlert') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLogoChange = (logoUrl: string, file?: File) => {
    setFormData({
      ...formData,
      storeLogo: logoUrl
    });
    
    if (file) {
      setStoreLogoFile(file);
    } else {
      setStoreLogoFile(null);
    }
  };

  const handleChannelLogoChange = (methodId: string, channelId: string, logoUrl: string, file?: File) => {
    const updatedPaymentMethods = formData.payment_methods.map(pm => {
      if (pm._id === methodId) {
        const updatedChannels = pm.channels.map(channel => {
          if (channel._id === channelId) {
            return { ...channel, logo: logoUrl };
          }
          return channel;
        });
        return { ...pm, channels: updatedChannels };
      }
      return pm;
    });
    
    setFormData({
      ...formData,
      payment_methods: updatedPaymentMethods
    });
    
    if (file) {
      const key = `${methodId}-${channelId}`;
      setChannelLogoFiles(prev => ({
        ...prev,
        [key]: file
      }));
    } else {
      const key = `${methodId}-${channelId}`;
      setChannelLogoFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[key];
        return newFiles;
      });
    }
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        paymentMethods: [...formData.paymentMethods, method]
      });
    } else {
      setFormData({
        ...formData,
        paymentMethods: formData.paymentMethods.filter(m => m !== method)
      });
    }
  };

  const handleTogglePaymentMethod = async (methodName: string, isActive: boolean) => {
    try {
      SweetAlert.loading('Mengubah status metode pembayaran...');
      
      const response = await fetch(`${BASE_API_URL}/payment-methods/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodName, isActive })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal mengubah status metode pembayaran');
      }
      
      SweetAlert.close();
      SweetAlert.success('Status metode pembayaran berhasil diubah');
      fetchSettings();
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal mengubah status metode pembayaran');
      console.error(error);
    }
  };

  const handleToggleChannelStatus = async (methodName: string, channelName: string, isActive: boolean) => {
    try {
      SweetAlert.loading('Mengubah status channel...');
      
      const response = await fetch(`${BASE_API_URL}/payment-methods/channel-toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodName, channelName, isActive })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal mengubah status channel');
      }
      
      SweetAlert.close();
      SweetAlert.success('Status channel berhasil diubah');
      fetchSettings();
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal mengubah status channel');
      console.error(error);
    }
  };

  const handleUpdateChannelName = async (methodId: string, channelId: string, newName: string) => {
    try {
      SweetAlert.loading('Mengubah nama channel...');
      
      const paymentMethod = formData.payment_methods.find(pm => pm._id === methodId);
      if (!paymentMethod) {
        throw new Error('Metode pembayaran tidak ditemukan');
      }
      
      const channel = paymentMethod.channels.find(c => c._id === channelId);
      if (!channel) {
        throw new Error('Channel tidak ditemukan');
      }
      
      const response = await fetch(`${BASE_API_URL}/payment-methods/channel-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          methodName: paymentMethod.method, 
          oldChannelName: channel.name, 
          newChannelName: newName 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal mengubah nama channel');
      }
      
      SweetAlert.close();
      SweetAlert.success('Nama channel berhasil diubah');
      fetchSettings();
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal mengubah nama channel');
      console.error(error);
    }
  };

  // Fungsi untuk menambah payment method baru
  const handleAddPaymentMethod = async (methodName: string, channels: { name: string }[] = []) => {
    try {
      SweetAlert.loading('Menambah metode pembayaran...');
      
      const response = await fetch(`${BASE_API_URL}/payment-methods/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          method: methodName,
          channels: channels.length > 0 ? channels : []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal menambah metode pembayaran');
      }
      
      SweetAlert.close();
      SweetAlert.success('Metode pembayaran berhasil ditambahkan');
      fetchSettings();
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal menambah metode pembayaran');
      console.error(error);
    }
  };

  // Fungsi untuk menambah channel baru
  const handleAddChannelToMethod = async (methodName: string, channelName: string, logoFile?: File) => {
    try {
      SweetAlert.loading('Menambah channel...');
      
      // Tambah channel tanpa logo terlebih dahulu
      const response = await fetch(`${BASE_API_URL}/payment-methods/add-channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          methodName, 
          channelName 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Gagal menambah channel');
      }
      
      // Jika ada logo file, upload logo
      if (logoFile) {
        const formData = new FormData();
        formData.append('methodName', methodName);
        formData.append('channelName', channelName);
        formData.append('logo', logoFile);
        
        const logoResponse = await fetch(`${BASE_API_URL}/payment-methods/channel-logo`, {
          method: 'PUT',
          body: formData
        });
        
        if (!logoResponse.ok) {
          const errorData = await logoResponse.json();
          console.error('Server error uploading logo:', errorData);
          // Jangan throw error di sini karena channel sudah berhasil ditambahkan
        }
      }
      
      SweetAlert.close();
      SweetAlert.success('Channel berhasil ditambahkan');
      fetchSettings();
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal menambah channel');
      console.error(error);
    }
  };

  // Fungsi untuk menghapus channel
  const handleDeleteChannel = async (methodName: string, channelName: string) => {
    try {
      // Tampilkan konfirmasi sebelum menghapus menggunakan SweetAlert.fire
      const result = await SweetAlert.fire({
        title: 'Apakah Anda yakin?',
        text: `Channel "${channelName}" akan dihapus dari metode "${methodName}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        SweetAlert.loading('Menghapus channel...');
        
        const response = await fetch(`${BASE_API_URL}/payment-methods/channel`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            methodName, 
            channelName 
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'Gagal menghapus channel');
        }
        
        SweetAlert.close();
        SweetAlert.success('Channel berhasil dihapus');
        fetchSettings();
      }
    } catch (error) {
      SweetAlert.close();
      SweetAlert.error(error instanceof Error ? error.message : 'Gagal menghapus channel');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      SweetAlert.loading('Menyimpan pengaturan...');
      
      const taxPayload = { taxRate: formData.taxRate };
      const discountPayload = { globalDiscount: formData.globalDiscount };
      const serviceChargePayload = { serviceCharge: formData.serviceCharge };
      const receiptPayload = { 
        receiptHeader: formData.receiptHeader,
        receiptFooter: formData.receiptFooter
      };
      
      // Buat FormData untuk store logo
      const storeFormData = new FormData();
      storeFormData.append('storeName', formData.storeName);
      storeFormData.append('storeAddress', formData.storeAddress);
      storeFormData.append('storePhone', formData.storePhone);
      
      if (storeLogoFile) {
        storeFormData.append('storeLogo', storeLogoFile);
      } else if (formData.storeLogo) {
        // Jika tidak ada file baru tapi ada logo lama, kirim URL-nya
        storeFormData.append('storeLogo', formData.storeLogo);
      }
      
      const generalPayload = {
        currency: formData.currency,
        dateFormat: formData.dateFormat,
        language: formData.language,
        lowStockAlert: formData.lowStockAlert,
        showBarcode: formData.showBarcode,
        showCashierName: formData.showCashierName
      };
      
      const requestUrls = [
        `${BASE_API_URL}/tax`,
        `${BASE_API_URL}/discount`,
        `${BASE_API_URL}/service-charge`,
        `${BASE_API_URL}/receipt`,
        `${BASE_API_URL}/payment-methods`,
        `${BASE_API_URL}/store`,
        `${BASE_API_URL}/general`
      ];
      
      // Buat salinan data payment methods tanpa base64 yang terlalu panjang
      const cleanedPaymentMethods = formData.payment_methods.map(pm => {
        const cleanedChannels = pm.channels.map(channel => {
          // Hapus logo base64 yang terlalu panjang
          if (channel.logo && channel.logo.startsWith('data:image') && channel.logo.length > 100) {
            return { ...channel, logo: '' };
          }
          return channel;
        });
        return { 
          ...pm, 
          channels: cleanedChannels,
          // Pastikan isActive adalah boolean
          isActive: Boolean(pm.isActive)
        };
      });
      
      // Pastikan payload yang dikirim adalah objek JSON yang valid
      const paymentPayload = { 
        payment_methods: cleanedPaymentMethods,
        paymentMethods: formData.paymentMethods
      };
      
      // Debug: Log payload yang akan dikirim
      console.log('Payment payload:', JSON.stringify(paymentPayload));
      
      // Buat FormData terpisah untuk upload logo channel
      const channelLogoFormData = new FormData();
      let hasChannelLogos = false;
      
      Object.entries(channelLogoFiles).forEach(([key, file]) => {
        if (file) { // Pastikan file ada
          // Parse key untuk mendapatkan methodId dan channelId
          const [methodId, channelId] = key.split('-');
          
          // Cari nama method dan channel berdasarkan ID
          const paymentMethod = formData.payment_methods.find(pm => pm._id === methodId);
          if (paymentMethod) {
            const channel = paymentMethod.channels.find(c => c._id === channelId);
            if (channel) {
              channelLogoFormData.append('methodName', paymentMethod.method);
              channelLogoFormData.append('channelName', channel.name);
              channelLogoFormData.append('logo', file);
              hasChannelLogos = true;
            }
          }
        }
      });
      
      const requests = [
        fetch(requestUrls[0], {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taxPayload)
        }),
        fetch(requestUrls[1], {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discountPayload)
        }),
        fetch(requestUrls[2], {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceChargePayload)
        }),
        fetch(requestUrls[3], {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(receiptPayload)
        }),
        // Gunakan FormData untuk store
        fetch(requestUrls[5], {
          method: 'PUT',
          body: storeFormData
        }),
        fetch(requestUrls[6], {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generalPayload)
        })
      ];
      
      // Jika ada logo channel yang perlu diupload, tambahkan request
      if (hasChannelLogos) {
        requests.push(
          fetch(`${BASE_API_URL}/payment-methods/channel-logo`, {
            method: 'PUT',
            body: channelLogoFormData
          })
        );
      }
      
      const responses = await Promise.all(requests);
      
      const errors = [];
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          try {
            // Cek content type sebelum parsing JSON
            const contentType = responses[i].headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await responses[i].json();
              errors.push({
                url: requestUrls[i] || `${BASE_API_URL}/payment-methods/channel-logo`,
                status: responses[i].status,
                message: errorData.message || 'Unknown error'
              });
            } else {
              // Jika bukan JSON, ambil sebagai teks
              const errorText = await responses[i].text();
              errors.push({
                url: requestUrls[i] || `${BASE_API_URL}/payment-methods/channel-logo`,
                status: responses[i].status,
                message: errorText.substring(0, 100) || 'Unknown error' // Batasi panjang pesan
              });
            }
          } catch {
            errors.push({
              url: requestUrls[i] || `${BASE_API_URL}/payment-methods/channel-logo`,
              status: responses[i].status,
              message: 'Failed to parse error response'
            });
          }
        }
      }
      
      if (errors.length > 0) {
        console.error('Errors:', errors);
        throw new Error(`${errors.length} pengaturan gagal disimpan: ${errors.map(e => e.message).join(', ')}`);
      }
      
      SweetAlert.close();
      SweetAlert.success('Semua pengaturan berhasil disimpan');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {activeTab === 'general' && (
              <GeneralSettings 
                formData={formData} 
                handleInputChange={handleInputChange}
                handleLogoChange={handleLogoChange}
              />
            )}
            
            {activeTab === 'receipt' && (
              <ReceiptSettings 
                formData={formData} 
                handleInputChange={handleInputChange} 
              />
            )}
            
            {activeTab === 'payment' && (
              <PaymentSettings 
                formData={formData} 
                handlePaymentMethodChange={handlePaymentMethodChange}
                handleChannelLogoChange={handleChannelLogoChange}
                onTogglePaymentMethod={handleTogglePaymentMethod}
                onUpdateChannelName={handleUpdateChannelName}
                onAddPaymentMethod={handleAddPaymentMethod}
                onAddChannelToMethod={handleAddChannelToMethod}
                onDeleteChannel={handleDeleteChannel}
                onToggleChannelStatus={handleToggleChannelStatus}
              />
            )}
            
            {activeTab === 'advanced' && (
              <AdvancedSettings 
                formData={formData} 
                handleInputChange={handleInputChange} 
              />
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;