// src/admin/dashboard/breakdown-pembayaran/index.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, CreditCard, Wallet, Landmark } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabel } from 'recharts';
import LoadingSpinner from '../../../components/LoadingSpinner'; // Adjust path as needed
const ipbe = import.meta.env.VITE_IPBE;
interface PaymentBreakdown {
  [key: string]: number;
}

interface ApiResponse {
  payment_breakdown: PaymentBreakdown;
}

// Komponen Detail Pembayaran Terpisah
interface PaymentDetailTableProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  colors: string[];
  total: number;
  formatRupiah: (amount: number) => string;
  getPaymentIcon: (method: string) => React.ReactNode;
}

const PaymentDetailTable: React.FC<PaymentDetailTableProps> = ({ 
  data, 
  colors, 
  total, 
  formatRupiah, 
  getPaymentIcon 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Pembayaran</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metode Pembayaran
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Persentase
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <div className="flex items-center">
                      {getPaymentIcon(item.name)}
                      <span className="ml-2 text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatRupiah(item.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.percentage.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatRupiah(total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                100%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gray-500" style={{ width: '100%' }}></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BreakdownPembayaran: React.FC = () => {
  const [data, setData] = useState<PaymentBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ipbe}:5000/api/admin/dashboard/breakdown-pembayaran`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        setData(result.payment_breakdown);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk mengelompokkan metode pembayaran yang serupa
  const groupPaymentMethods = (payments: PaymentBreakdown): PaymentBreakdown => {
    const grouped: PaymentBreakdown = {};
    
    Object.entries(payments).forEach(([method, amount]) => {
      const normalizedMethod = method.toLowerCase();
      
      if (normalizedMethod.includes('virtual account') || normalizedMethod.includes('va')) {
        grouped['Virtual Account'] = (grouped['Virtual Account'] || 0) + amount;
      } else if (normalizedMethod.includes('e-wallet') || normalizedMethod.includes('ewallet')) {
        grouped['E-Wallet'] = (grouped['E-Wallet'] || 0) + amount;
      } else if (normalizedMethod.includes('tunai') || normalizedMethod.includes('cash')) {
        grouped['Tunai'] = (grouped['Tunai'] || 0) + amount;
      } else if (normalizedMethod.includes('kartu kredit') || normalizedMethod.includes('credit')) {
        grouped['Kartu Kredit'] = (grouped['Kartu Kredit'] || 0) + amount;
      } else {
        grouped[method] = (grouped[method] || 0) + amount;
      }
    });
    
    return grouped;
  };

  // Format angka ke Rupiah
  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hitung total semua pembayaran
  const calculateTotal = (payments: PaymentBreakdown): number => {
    return Object.values(payments).reduce((total, amount) => total + amount, 0);
  };

  // Dapatkan icon berdasarkan metode pembayaran
  const getPaymentIcon = (method: string): React.ReactNode => {
    if (method.includes('Virtual Account')) return <Landmark className="h-5 w-5 text-blue-500" />;
    if (method.includes('E-Wallet')) return <Wallet className="h-5 w-5 text-green-500" />;
    if (method.includes('Tunai')) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    if (method.includes('Kartu Kredit')) return <CreditCard className="h-5 w-5 text-purple-500" />;
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  };

  // Warna untuk setiap metode pembayaran
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Breakdown Pembayaran</h1>
          <p className="text-gray-600">Analisis metode pembayaran yang digunakan</p>
        </div>
        
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Breakdown Pembayaran</h1>
          <p className="text-gray-600">Analisis metode pembayaran yang digunakan</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">Gagal memuat data: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Breakdown Pembayaran</h1>
          <p className="text-gray-600">Analisis metode pembayaran yang digunakan</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700">Tidak ada data pembayaran yang tersedia.</p>
        </div>
      </div>
    );
  }

  const groupedData = groupPaymentMethods(data);
  const total = calculateTotal(groupedData);
  
  // Siapkan data untuk pie chart
  const pieData = Object.entries(groupedData).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));

  // Custom label renderer untuk pie chart
  const renderLabel: PieLabel = (props) => {
    // Menggunakan unknown untuk type assertion yang aman
    const { name, percent } = props as unknown as { name: string; percent: number };
    const percentage = percent * 100; // Recharts menyediakan percent sebagai desimal (0-1)
    return `${name}: ${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Breakdown Pembayaran</h1>
        <p className="text-gray-600">Analisis metode pembayaran yang digunakan</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h2 className="text-xl font-semibold text-gray-800">Total Pembayaran: {formatRupiah(total)}</h2>
      </div>
      
      {/* Pie Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribusi Pembayaran</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderLabel}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRupiah(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Detail Pembayaran sebagai komponen terpisah */}
      <PaymentDetailTable 
        data={pieData}
        colors={COLORS}
        total={total}
        formatRupiah={formatRupiah}
        getPaymentIcon={getPaymentIcon}
      />
    </div>
  );
};

export default BreakdownPembayaran;