import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

interface OmzetChartProps {
  omzetData: OmzetData | null;
  selectedPeriod: 'hari' | 'minggu' | 'bulan';
  setSelectedPeriod: (period: 'hari' | 'minggu' | 'bulan') => void;
  formatRupiah: (amount: number) => string;
}

const OmzetChart: React.FC<OmzetChartProps> = ({ 
  omzetData, 
  selectedPeriod, 
  setSelectedPeriod,
  formatRupiah
}) => {
  // Data untuk chart
  const chartData = {
    labels: ['Hari Ini', 'Minggu Ini', 'Bulan Ini'],
    values: omzetData ? [
      omzetData.hari_ini,
      omzetData.minggu_ini,
      omzetData.bulan_ini
    ] : [0, 0, 0]
  };

  // Konfigurasi diagram garis
  const lineChartData: ChartData<'line'> = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Omzet (Rp)',
        data: chartData.values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            return `Omzet: ${formatRupiah(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return formatRupiah(value);
            }
            return value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Grafik Omzet</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPeriod('hari')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedPeriod === 'hari' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setSelectedPeriod('minggu')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedPeriod === 'minggu' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setSelectedPeriod('bulan')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedPeriod === 'bulan' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Diagram Garis menggunakan Chart.js */}
      <div className="h-80">
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
    </div>
  );
};

export default OmzetChart;