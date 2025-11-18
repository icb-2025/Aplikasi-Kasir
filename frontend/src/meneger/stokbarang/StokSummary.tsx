import type { Barang } from "../../admin/stok-barang";
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface StokSummaryProps {
  dataBarang: Barang[];
}

export default function StokSummary({ dataBarang }: StokSummaryProps) {
  // Hitung statistik berdasarkan dataBarang
  const totalItems = dataBarang.length;
  const totalStock = dataBarang.reduce((sum, item) => sum + item.stok, 0);
  const lowStockItems = dataBarang.filter(item => item.stok > 0 && item.stok <= (item.stokMinimal || 5)).length;
  const outOfStockItems = dataBarang.filter(item => item.stok === 0).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Jenis Barang</p>
            <p className="text-xl font-bold text-gray-800">{totalItems}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Stok</p>
            <p className="text-xl font-bold text-gray-800">{totalStock} unit</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg mr-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Stok Menipis</p>
            <p className="text-xl font-bold text-gray-800">{lowStockItems} item</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg mr-3">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Stok Habis</p>
            <p className="text-xl font-bold text-gray-800">{outOfStockItems} item</p>
          </div>
        </div>
      </div>
    </div>
  );
}