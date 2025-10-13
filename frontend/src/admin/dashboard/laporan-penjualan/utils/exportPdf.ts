// src/admin/dashboard/laporan-penjualan/utils/exportPdf.ts
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatRupiah } from '../../../utils/formatRupiah';

// Interface untuk data produk terlaris
interface ProdukTerlaris {
  produk: string;
  harga_jual: number;
  harga_beli: number;
  labaPerItem: number;
  jumlahTerjual: number;
  totalLaba: number;
}

// Interface untuk data metode pembayaran
interface MetodePembayaran {
  metode: string;
  total: number;
}

// Interface untuk biaya operasional
interface BiayaOperasional {
  _id: string;
  listrik: number;
  air: number;
  internet: number;
  sewa_tempat: number;
  gaji_karyawan: number;
  total: number;
  createdAt: string;
  __v: number;
}

// Interface untuk data laporan
interface LaporanData {
  periode: {
    start: string;
    end: string;
  };
  laba: {
    total_laba: number;
    detail: ProdukTerlaris[];
  };
  rekap_metode_pembayaran: MetodePembayaran[];
  totalPendapatan: number;
  totalBarangTerjual: number;
  pengeluaran: number;
  biaya_operasional: BiayaOperasional; // Tambahkan biaya operasional
}

// Interface untuk options autoTable
interface AutoTableOptions {
  head: string[][];
  body: string[][];
  startY?: number;
  styles?: {
    fontSize?: number;
    cellPadding?: number;
  };
  headStyles?: {
    fillColor?: [number, number, number];
    textColor?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  };
  columnStyles?: {
    [key: string]: {
      halign?: 'left' | 'center' | 'right';
    };
  };
}

// Interface untuk jsPDF dengan autoTable
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Fungsi untuk mengekspor data ke PDF
export const exportPdf = (data: LaporanData) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Tambahkan judul
  doc.setFontSize(18);
  doc.text('Laporan Penjualan', 105, 15, { align: 'center' });
  
  // Tambahkan periode
  doc.setFontSize(12);
  const periodeText = `Periode: ${new Date(data.periode.start).toLocaleDateString('id-ID')} - ${new Date(data.periode.end).toLocaleDateString('id-ID')}`;
  doc.text(periodeText, 105, 25, { align: 'center' });
  
  // Tambahkan ringkasan
  doc.setFontSize(14);
  doc.text('Ringkasan', 14, 40);
  
  doc.setFontSize(10);
  doc.text(`Total Laba: ${formatRupiah(data.laba.total_laba)}`, 14, 50);
  doc.text(`Total Pendapatan: ${formatRupiah(data.totalPendapatan)}`, 14, 56);
  doc.text(`Total Transaksi: ${data.laba.detail.length}`, 14, 62);
  doc.text(`Total Barang Terjual: ${data.totalBarangTerjual}`, 14, 68);
  doc.text(`Biaya Operasional: ${formatRupiah(data.biaya_operasional.total)}`, 14, 74);
  
  // Hitung laba kotor
  const totalHargaBeli = data.laba.detail.reduce((sum, item) => sum + item.harga_beli, 0);
  const labaKotor = data.totalPendapatan - totalHargaBeli;
  doc.text(`Laba Kotor: ${formatRupiah(labaKotor)}`, 14, 80);
  
  // Tambahkan tabel biaya operasional
  doc.setFontSize(14);
  doc.text('Detail Biaya Operasional', 14, 95);
  
  const biayaOperasionalTable: AutoTableOptions = {
    head: [['Kategori', 'Jumlah']],
    body: [
      ['Listrik', formatRupiah(data.biaya_operasional.listrik)],
      ['Air', formatRupiah(data.biaya_operasional.air)],
      ['Internet', formatRupiah(data.biaya_operasional.internet)],
      ['Sewa Tempat', formatRupiah(data.biaya_operasional.sewa_tempat)],
      ['Gaji Karyawan', formatRupiah(data.biaya_operasional.gaji_karyawan)],
      ['Total', formatRupiah(data.biaya_operasional.total)]
    ],
    startY: 100,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [63, 81, 181], // RGB untuk biru
      textColor: 255, // Putih
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' }
    }
  };
  
  autoTable(doc, biayaOperasionalTable);
  
  // Tambahkan tabel produk terlaris
  doc.setFontSize(14);
  doc.text('Produk Terlaris', 14, doc.lastAutoTable.finalY + 15);
  
  const produkTable: AutoTableOptions = {
    head: [['Produk', 'Harga Jual', 'Harga Beli', 'Laba/Item', 'Jumlah Terjual', 'Total Laba']],
    body: data.laba.detail.map(item => [
      item.produk,
      formatRupiah(item.harga_jual),
      formatRupiah(item.harga_beli),
      formatRupiah(item.labaPerItem),
      item.jumlahTerjual.toString(),
      formatRupiah(item.totalLaba)
    ]),
    startY: doc.lastAutoTable.finalY + 20,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [63, 81, 181], // RGB untuk biru
      textColor: 255, // Putih
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center' },
      5: { halign: 'right' }
    }
  };
  
  autoTable(doc, produkTable);
  
  // Tambahkan tabel metode pembayaran
  doc.setFontSize(14);
  doc.text('Metode Pembayaran', 14, doc.lastAutoTable.finalY + 15);
  
  const metodeTable: AutoTableOptions = {
    head: [['Metode', 'Total']],
    body: data.rekap_metode_pembayaran.map(item => [
      item.metode,
      formatRupiah(item.total)
    ]),
    startY: doc.lastAutoTable.finalY + 20,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [63, 81, 181], // RGB untuk biru
      textColor: 255, // Putih
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' }
    }
  };
  
  autoTable(doc, metodeTable);
  
  // Simpan file
  doc.save(`Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.pdf`);
};