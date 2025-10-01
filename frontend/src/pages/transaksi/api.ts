// export interface TransactionItem {
//   barang_id: string;
//   kode: string;
//   nama: string;
//   jumlah_barang: number;
//   harga: number;
//   subtotal: number;
// }

// export interface TransactionPayload {
//   nomor_transaksi: string;
//   customer: string;
//   metode_pembayaran: string;
//   total_harga: number;
//   barang_dibeli: TransactionItem[];
// }

// // Kalau datanya belum fix, pakai unknown supaya aman
// export interface TransactionResponse {
//   success: boolean;
//   message: string;
//   data?: unknown;
// }

// /**
//  * Create a new transaction with enhanced debugging
//  */
// export const createTransaction = async (
//   payload: TransactionPayload
// ): Promise<TransactionResponse> => {
//   try {
//     console.log("🔄 Sending transaction to backend:", payload);

//     // Validate payload before sending
//     const invalidItems = payload.barang_dibeli.filter(
//       (item) =>
//         !item.barang_id ||
//         item.barang_id === "undefined" ||
//         item.barang_id === "null"
//     );

//     if (invalidItems.length > 0) {
//       console.error("❌ Invalid items in payload:", invalidItems);
//       throw new Error("Terdapat barang dengan ID tidak valid dalam transaksi");
//     }

//     const response = await fetch("/api/transaksi", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     console.log("📨 Response status:", response.status);

//     if (!response.ok) {
//       let errorMessage = `HTTP error ${response.status}`;
//       try {
//         const errorData = await response.json();
//         errorMessage = errorData.message || errorMessage;
//         console.error("🔍 Backend error details:", errorData);
//       } catch {
//         try {
//           const textResponse = await response.text();
//           console.error("📝 Raw error response:", textResponse);
//           errorMessage = textResponse || errorMessage;
//         } catch {
//           console.error("❌ Cannot parse error response");
//         }
//       }
//       throw new Error(errorMessage);
//     }

//     const result: TransactionResponse = await response.json();
//     console.log("✅ Transaction successful:", result);
//     return result;
//   } catch (error) {
//     console.error("❌ Error creating transaction:", error);
//     throw error;
//   }
// };
