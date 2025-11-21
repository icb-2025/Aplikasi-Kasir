// src/components/SweetAlert.tsx

import Swal from 'sweetalert2';
import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

export class SweetAlert {
  // Konfirmasi penghapusan
  static async confirmDelete(): Promise<SweetAlertResult> {
    return Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
  }

  // Notifikasi sukses
  static async success(message: string, timer: number = 2000): Promise<SweetAlertResult> {
    return Swal.fire({
      title: 'Sukses!',
      text: message,
      icon: 'success',
      timer,
      showConfirmButton: false
    });
  }

  // Notifikasi error
  static async error(message: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  // Loading
  static async loading(message: string = 'Memproses...'): Promise<void> {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Alert
  static async warning(message: string, timer: number = 2000): Promise<SweetAlertResult> {
    return Swal.fire({
      title: 'Peringatan!',
      text: message,
      icon: 'warning',
      timer,
      showConfirmButton: false
    });
  }

  // Close alert
  static close(): void {
    Swal.close();
  }

  // Custom alert
  static async fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return Swal.fire(options);
  }
}

export default SweetAlert;