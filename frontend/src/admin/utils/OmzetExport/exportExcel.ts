import * as XLSX from 'xlsx';
import { formatRupiah } from '../formatRupiah';

interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

export const exportOmzetToExcel = (omzetData: OmzetData | null) => {
  if (!omzetData) return;

  const data = [
    ['Periode', 'Omzet', 'Target', 'Pencapaian', 'Pertumbuhan'],
    ['Hari Ini', formatRupiah(omzetData.hari_ini), formatRupiah(50000000), 
      `${Math.round((omzetData.hari_ini / 50000000) * 100)}%`, '+12.5%'],
    ['Minggu Ini', formatRupiah(omzetData.minggu_ini), formatRupiah(450000000), 
      `${Math.round((omzetData.minggu_ini / 450000000) * 100)}%`, '+8.3%'],
    ['Bulan Ini', formatRupiah(omzetData.bulan_ini), formatRupiah(2000000000), 
      `${Math.round((omzetData.bulan_ini / 2000000000) * 100)}%`, '+15.2%']
  ];

  // Membuat worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Membuat workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Omzet');

  // Menyimpan file
  XLSX.writeFile(wb, `laporan_omzet_${new Date().toISOString().split('T')[0]}.xlsx`);
};