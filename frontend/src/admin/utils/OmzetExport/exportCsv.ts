import { formatRupiah } from '../formatRupiah';

interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

export const exportOmzetToCsv = (omzetData: OmzetData | null) => {
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
  
  const csvContent = "data:text/csv;charset=utf-8," + 
    data.map(row => row.join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `laporan_omzet_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};