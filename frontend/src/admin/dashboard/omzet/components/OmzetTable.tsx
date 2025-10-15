import React from 'react';

interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

interface OmzetTableProps {
  omzetData: OmzetData | null;
  formatRupiah: (amount: number) => string;
}

const OmzetTable: React.FC<OmzetTableProps> = ({ omzetData, formatRupiah: formatRupiahFn }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Detail Omzet</h2>
        <p className="text-sm text-gray-600">Ringkasan performa omzet toko</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Periode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Omzet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pencapaian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pertumbuhan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Baris Hari Ini */}
            <tr className="hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Hari Ini</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-600">
                  {omzetData ? formatRupiahFn(omzetData.hari_ini) : 'Rp 0'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatRupiahFn(50000000)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${omzetData ? Math.min(100, Math.round((omzetData.hari_ini / 50000000) * 100)) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-900">
                    {omzetData ? `${Math.round((omzetData.hari_ini / 50000000) * 100)}%` : '0%'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  +12.5%
                </span>
              </td>
            </tr>
            
            {/* Baris Minggu Ini */}
            <tr className="hover:bg-green-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Minggu Ini</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-600">
                  {omzetData ? formatRupiahFn(omzetData.minggu_ini) : 'Rp 0'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatRupiahFn(450000000)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${omzetData ? Math.min(100, Math.round((omzetData.minggu_ini / 450000000) * 100)) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-900">
                    {omzetData ? `${Math.round((omzetData.minggu_ini / 450000000) * 100)}%` : '0%'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  +8.3%
                </span>
              </td>
            </tr>
            
            {/* Baris Bulan Ini */}
            <tr className="hover:bg-purple-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Bulan Ini</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-purple-600">
                  {omzetData ? formatRupiahFn(omzetData.bulan_ini) : 'Rp 0'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatRupiahFn(2000000000)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${omzetData ? Math.min(100, Math.round((omzetData.bulan_ini / 2000000000) * 100)) : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-900">
                    {omzetData ? `${Math.round((omzetData.bulan_ini / 2000000000) * 100)}%` : '0%'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  +15.2%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OmzetTable;