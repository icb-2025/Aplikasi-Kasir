// src/meneger/laporan/components/utils.ts
export const formatMethodName = (method: string) => {
  const methodNames: {[key: string]: string} = {
    'cash': 'Tunai',
    'debit': 'Kartu Debit',
    'credit': 'Kartu Kredit',
    'qris': 'QRIS',
    'e-wallet': 'E-Wallet',
    'transfer': 'Transfer Bank',
    'tunai': 'Tunai',
    'virtual account (bni)': 'Virtual Account (BNI)'
  };
  return methodNames[method.toLowerCase()] || method;
};