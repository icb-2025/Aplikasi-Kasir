// src/meneger/laporan/components/SummaryCards.tsx
import React from 'react';
import { TrendingUp, DollarSign, AlertCircle, Calendar, PieChart } from 'lucide-react';

interface SummaryCardsProps {
  totalLaba: number;
  totalPendapatan: number;
  totalBeban: number;
  totalLabaKotor: number;
  periode: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  totalLaba, 
  totalPendapatan, 
  totalBeban,
  totalLabaKotor,
  periode
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const isProfit = totalLaba >= 0;
  const profitStatusColor = isProfit ? 'text-green-600' : 'text-red-600';
  const profitStatusBg = isProfit ? 'bg-green-100' : 'bg-red-100';
  const profitStatusIcon = isProfit ? 
    <TrendingUp className="h-6 w-6 text-green-600" /> : 
    <AlertCircle className="h-6 w-6 text-red-600" />;

  // Calculate profit margin
  const profitMargin = totalPendapatan > 0 ? (totalLabaKotor / totalPendapatan) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Total Pendapatan Card */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
          </div>
          <p className="text-xl font-bold text-gray-900 ml-11">
            {formatCurrency(totalPendapatan)}
          </p>
        </div>
      </div>

      {/* Total Beban Card */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-yellow-100 mr-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Beban</p>
          </div>
          <p className="text-xl font-bold text-gray-900 ml-11">
            {formatCurrency(totalBeban)}
          </p>
        </div>
      </div>

      {/* Laba Kotor Card */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-purple-100 mr-3">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Laba Kotor</p>
          </div>
          <div className="ml-11">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(totalLabaKotor)}
            </p>
            <div className="mt-1">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                Margin: {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Laba Bersih Card */}
      <div className={`bg-white p-5 rounded-xl shadow-md border-l-4 ${isProfit ? 'border-green-500' : 'border-red-500'} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex flex-col">
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full ${profitStatusBg} mr-3`}>
              {profitStatusIcon}
            </div>
            <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
          </div>
          <p className={`text-xl font-bold ml-11 ${profitStatusColor}`}>
            {formatCurrency(totalLaba)}
          </p>
        </div>
      </div>

      {/* Periode Card */}
      <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-indigo-100 mr-3">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Periode</p>
          </div>
          <p className="text-xl font-bold text-gray-900 ml-11">
            {periode || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;