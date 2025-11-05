import type { Barang } from "../../admin/stok-barang";

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3,1.732 3z" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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