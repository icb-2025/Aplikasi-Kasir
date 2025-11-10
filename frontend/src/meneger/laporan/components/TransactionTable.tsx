// src/meneger/laporan/components/TransactionTable.tsx
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatMethodName } from './utils';
import { 
  Landmark, 
  Wallet, 
  TrendingUp, 
  CreditCard,
  Smartphone,
  Building2,
  University,
  QrCode,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TransactionTableProps {
  tableData: Array<{
    id: string;
    metode: string;
    total: number;
    laba: number;
    tanggal: string;
  }>;
}

// Dapatkan icon berdasarkan metode pembayaran
const getPaymentIcon = (method: string): React.ReactNode => {
  if (method.includes('Virtual Account')) return <Landmark className="h-5 w-5 text-blue-500" />;
  if (method.includes('E-Wallet')) return <Wallet className="h-5 w-5 text-green-500" />;
  if (method.includes('Tunai')) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
  if (method.includes('Kartu Kredit')) return <CreditCard className="h-5 w-5 text-purple-500" />;
  if (method.includes('QRIS')) return <QrCode className="h-5 w-5 text-indigo-500" />;
  if (method.includes('Gerai')) return <Building2 className="h-5 w-5 text-orange-500" />;
  if (method.includes('Indomaret')) return <Smartphone className="h-5 w-5 text-red-500" />;
  if (method.includes('Alfamart')) return <University className="h-5 w-5 text-blue-700" />;
  return <CreditCard className="h-5 w-5 text-gray-500" />;
};

const TransactionTable: React.FC<TransactionTableProps> = ({ tableData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Export to PDF with table
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Laporan Transaksi', 105, 15, { align: 'center' });
    
    // Prepare data for table
    const tableDataForPDF = tableData.map((item, index) => [
      index + 1,
      item.tanggal,
      formatMethodName(item.metode),
      `Rp ${item.total.toLocaleString('id-ID')}`,
      `Rp ${item.laba.toLocaleString('id-ID')}`,
      item.total > 0 ? `${((item.laba / item.total) * 100).toFixed(2)}%` : '0%'
    ]);
    
    // Add table using autoTable
    autoTable(doc, {
      head: [['No', 'Tanggal', 'Metode Pembayaran', 'Total Penjualan', 'Laba', 'Persentase Laba']],
      body: tableDataForPDF,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 15 }, // No
        1: { cellWidth: 25 }, // Tanggal
        2: { cellWidth: 40 }, // Metode Pembayaran
        3: { cellWidth: 40 }, // Total Penjualan
        4: { cellWidth: 35 }, // Laba
        5: { cellWidth: 25 }, // Persentase Laba
      },
    });
    
    // Add footer with page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save('laporan-transaksi.pdf');
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tableData.map((item, index) => ({
        'No': index + 1,
        'Tanggal': item.tanggal,
        'Metode Pembayaran': formatMethodName(item.metode),
        'Total Penjualan': item.total,
        'Laba': item.laba,
        'Persentase Laba': item.total > 0 ? ((item.laba / item.total) * 100).toFixed(2) + '%' : '0%'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');
    
    XLSX.writeFile(workbook, 'laporan-transaksi.xlsx');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Detail Transaksi</h3>
        <div className="flex space-x-2">
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>
      
      {currentItems.length > 0 ? (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Penjualan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persentase Laba
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((item, index) => {
                    const profitPercentage = item.total > 0 ? ((item.laba / item.total) * 100).toFixed(2) : '0';
                    const profitPercentageNum = parseFloat(profitPercentage);
                    
                    return (
                      <tr 
                        key={index} 
                        className={`transition-colors hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-amber-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.tanggal}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              {getPaymentIcon(item.metode)}
                              <span className="ml-2">{formatMethodName(item.metode)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rp {item.total.toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${profitPercentageNum >= 20 ? 'bg-green-100 text-green-800' : profitPercentageNum >= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {profitPercentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Updated to match UsersPage */}
          {tableData.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, tableData.length)}</span> dari{' '}
                <span className="font-semibold text-gray-900">{tableData.length}</span> transaksi
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105'
                  }`}
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>Tidak ada data transaksi</p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;