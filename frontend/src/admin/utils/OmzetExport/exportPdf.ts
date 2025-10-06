import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah } from '../formatRupiah';

interface OmzetData {
  hari_ini: number;
  minggu_ini: number;
  bulan_ini: number;
}

export const exportOmzetToPdf = (omzetData: OmzetData | null) => {
  if (!omzetData) return;

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Laporan Omzet', 14, 15);
  doc.setFontSize(12);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 25);

  // Data untuk tabel
  const data = [
    ['Periode', 'Omzet', 'Target', 'Pencapaian', 'Pertumbuhan'],
    ['Hari Ini', formatRupiah(omzetData.hari_ini), formatRupiah(50000000), 
      `${Math.round((omzetData.hari_ini / 50000000) * 100)}%`, '+12.5%'],
    ['Minggu Ini', formatRupiah(omzetData.minggu_ini), formatRupiah(450000000), 
      `${Math.round((omzetData.minggu_ini / 450000000) * 100)}%`, '+8.3%'],
    ['Bulan Ini', formatRupiah(omzetData.bulan_ini), formatRupiah(2000000000), 
      `${Math.round((omzetData.bulan_ini / 2000000000) * 100)}%`, '+15.2%']
  ];

  // Membuat tabel dengan autoTable
  autoTable(doc, {
    head: [data[0]],
    body: data.slice(1),
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 }
    }
  });

  // Menyimpan file
  doc.save(`laporan_omzet_${new Date().toISOString().split('T')[0]}.pdf`);
};