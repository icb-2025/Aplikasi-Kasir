// src/meneger/laporan/components/TransactionChart.tsx
import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import { formatMethodName } from './utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define proper type for chart ref
type ChartJSOrUndefined = ChartJS<'bar', (number | [number, number] | null)[], unknown> | undefined;

interface TransactionChartProps {
  rekapMetodePembayaran: Array<{
    metode: string;
    total: number;
    _id: string;
  }>;
  labaDetail: Array<{
    laba: number;
    _id: string;
  }>;
}

const TransactionChart: React.FC<TransactionChartProps> = ({
  rekapMetodePembayaran,
  labaDetail
}) => {
  const chartRef = useRef<ChartJSOrUndefined>(undefined);

  // Siapkan data untuk grafik transaksi
  const chartData: ChartData<'bar'> = {
    labels: rekapMetodePembayaran?.map(item => formatMethodName(item.metode)) || [],
    datasets: [
      {
        label: 'Total Penjualan',
        data: rekapMetodePembayaran?.map(item => item.total) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'Total Laba',
        data: labaDetail?.map(item => item.laba) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  // Opsi grafik
  const chartOptions: ChartOptions<'bar'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      title: {
        display: true,
        text: 'Perbandingan Total Penjualan dan Total Laba per Metode Pembayaran',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 15,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const value = typeof context.raw === 'number' ? context.raw : 0;
            const label = context.dataset.label || '';
            return `${label}: Rp ${value.toLocaleString('id-ID')}`;
          },
          afterLabel: function(context: TooltipItem<'bar'>) {
            if (context.datasetIndex === 1) return undefined;
            
            const salesValue = context.chart.data.datasets[0].data[context.dataIndex] as number;
            const profitValue = context.chart.data.datasets[1].data[context.dataIndex] as number;
            
            if (salesValue > 0) {
              const percentage = ((profitValue / salesValue) * 100).toFixed(2);
              return `Persentase Laba: ${percentage}%`;
            }
            return 'Persentase Laba: 0%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              if (value >= 1000000) {
                return 'Rp ' + (value / 1000000).toFixed(1) + 'Jt';
              } else if (value >= 1000) {
                return 'Rp ' + (value / 1000).toFixed(0) + 'Rb';
              }
              return 'Rp ' + value.toLocaleString('id-ID');
            }
            return value;
          },
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Jumlah (Rupiah)',
          font: {
            size: 12,
            weight: 600
          },
          padding: {
            top: 10,
            bottom: 10
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Metode Pembayaran',
          font: {
            size: 12,
            weight: 600
          },
          padding: {
            top: 10,
            bottom: 10
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const toggleDataVisibility = (showAll: boolean) => {
    if (chartRef.current) {
      const chartInstance = chartRef.current;
      if (chartInstance) {
        chartInstance.data.datasets.forEach((_, i: number) => { // Mengganti 'dataset' dengan '_'
          if (i === 0) {
            chartInstance.setDatasetVisibility(i, true);
          } else {
            chartInstance.setDatasetVisibility(i, showAll);
          }
        });
        chartInstance.update();
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Grafik Transaksi per Metode Pembayaran</h3>
        <div className="flex space-x-2">
          <button 
            className="text-xs px-3 py-1 rounded transition-colors bg-blue-500 text-white"
            onClick={() => toggleDataVisibility(true)}
          >
            Tampilkan Semua
          </button>
          <button 
            className="text-xs px-3 py-1 rounded transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={() => toggleDataVisibility(false)}
          >
            Hanya Penjualan
          </button>
        </div>
      </div>
      
      <div className="h-96 relative">
        {rekapMetodePembayaran?.length ? (
          <Bar 
            ref={chartRef}
            data={chartData} 
            options={chartOptions} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Tidak ada data transaksi
          </div>
        )}
      </div>
      
      {rekapMetodePembayaran?.length && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rekapMetodePembayaran.map((payment, index) => {
            const sales = payment.total;
            const profit = labaDetail?.[index]?.laba || 0;
            const percentage = sales > 0 ? ((profit / sales) * 100).toFixed(2) : '0';
            const percentageNum = parseFloat(percentage);
            
            return (
              <div key={payment._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">
                  {formatMethodName(payment.metode)}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Penjualan: </span>
                    <span className="font-semibold">Rp {sales.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Laba: </span>
                    <span className="font-semibold">Rp {profit.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Margin: </span>
                    <span className={`font-semibold ${percentageNum >= 20 ? 'text-green-600' : percentageNum >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {percentage}%
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${percentageNum >= 20 ? 'bg-green-500' : percentageNum >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(percentageNum, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionChart;