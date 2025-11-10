export const calculateHargaFinal = (hargaJual, taxRate = 0, globalDiscount = 0, serviceCharge = 0) => {
  const hargaDiskon = hargaJual - (hargaJual * globalDiscount) / 100;
  const hargaPajak = hargaDiskon + (hargaDiskon * taxRate) / 100;
  const hargaFinal = hargaPajak + (hargaPajak * serviceCharge) / 100;
  return Math.round(hargaFinal);
};

// Fungsi untuk mengupdate hargaFinal pada semua barang
export const updateAllBarangHargaFinal = async (Barang, settings) => {
  const barang = await Barang.find();
  const { taxRate = 0, globalDiscount = 0, serviceCharge = 0 } = settings;
  
  for (let b of barang) {
    b.hargaFinal = calculateHargaFinal(b.harga_jual, taxRate, globalDiscount, serviceCharge);
    await b.save();
  }
  
  return barang;
};