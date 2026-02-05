# Log Perubahan Implementasi QR Code

## 1. Instalasi Library
Menambahkan dependency baru ke `package.json`:
- `qrcode`: Untuk membuat (generate) gambar QR code.
- `html5-qrcode`: Untuk memindai (scan) QR code menggunakan kamera.

## 2. Perubahan pada `src/pages/PengurusKelas/PresensiKelas.jsx` (Generate QR)
Sebelumnya menggunakan API eksternal (`goqr.me` / `qrserver`), sekarang diubah menjadi generate lokal di browser.

**Perubahan Detail:**
- **Import Library:**
  ```javascript
  import QRCode from 'qrcode';
  ```
- **State Management:**
  Menambahkan state `qrCodeUrl` untuk menyimpan hasil generate gambar QR.
  ```javascript
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  ```
- **Login Generate QR:**
  Membuat fungsi `generateQR` yang dipanggil setiap kali modal dibuka.
  ```javascript
  const generateQR = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, { width: 300, margin: 2 });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };
  ```
- **UI Update:**
  Mengganti tag `<img>` yang sebelumnya mengarah ke URL eksternal menjadi state `qrCodeUrl`.

## 3. Perubahan pada `src/pages/Guru/DashboardGuru.jsx` (Scan QR)
Sebelumnya hanya berupa simulasi (mockup) dengan tombol "Simulasi Scan Berhasil", sekarang menggunakan kamera asli.

**Perubahan Detail:**
- **Import Library:**
  ```javascript
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { useRef } from 'react'; // Menambahkan useRef
  ```
- **Scanner Logic:**
  - Menambahkan `scannerRef` untuk mengontrol instance scanner.
  - Menggunakan `useEffect` untuk menginisialisasi scanner saat modal dibuka (`selectedSchedule` ada).
  - Menambahkan cleanup function untuk mematikan kamera saat modal ditutup.
  ```javascript
  const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } });
  scanner.render(onScanSuccess, onScanFailure);
  ```
- **UI Update:**
  - Menambahkan `<div id="reader">` sebagai container kamera.
  - Menghapus elemen mockup QR pattern dan tombol simulasi.

## Catatan
- Scanner akan meminta izin kamera browser saat pertama kali dijalankan.
- Pastikan aplikasi dijalankan di `localhost` atau `https` agar izin kamera berfungsi.

## 4. Implementasi Custom Alert System
Menggantikan alert browser bawaan (`window.confirm`) dengan komponen kustom yang lebih modern dan konsisten untuk fitur Logout.

**Perubahan Detail:**
- **Komponen Baru:** `src/components/Common/CustomAlert.jsx` & `CustomAlert.css`.
- **Integrasi Navbar:**
  - `src/components/Common/Navbar.jsx`: Logout button sekarang memicu `CustomAlert`.
- **Integrasi Dashboard:**
  - `src/pages/Guru/DashboardGuru.jsx`
  - `src/pages/Siswa/DashboardSiswa.jsx`
  - `src/pages/Waka/DashboardWaka.jsx`
  - `src/pages/WaliKelas/DashboardWakel.jsx`
  - `src/pages/PengurusKelas/DashboardKelas.jsx`
  - Semua file di atas telah diperbarui untuk menggunakan import `CustomAlert` dan state management untuk popup konfirmasi logout.

## 5. Perbaikan UI/CSS Global
Memperbaiki isu visual di mana placeholder input berwarna putih (tidak terlihat) karena mewarisi properti color dari root pada background putih.

**Perubahan Detail:**
- **File:** `src/index.css`
- **Fix:** Menambahkan rule CSS global untuk elemen input:
  ```css
  input, textarea, select {
      color: #1f2937; /* Dark gray text */
  }
  
  input::placeholder, 
  textarea::placeholder, 
  select::placeholder {
      color: #6b7280; /* Visible gray placeholder */
      opacity: 1;
  }
  ```

## 6. Refactoring Menyeluruh Native Alert & Bug Fixes
Menggantikan seluruh sisa penggunaan `alert()` dan `window.confirm()` di dalam aplikasi, serta memperbaiki bug duplikasi deklarasi.

**Daftar File yang Direfactor:**
- **Admin Data Management:** `DataGuru.jsx`, `DataKelas.jsx`, `DataJurusan.jsx`, `DataSiswa.jsx`
- **Waka Schedule:** `JadwalGuruShow.jsx`, `JadwalSiswaShow.jsx`
- **Attendance & Validation:** `PresensiSiswa.jsx`, `InputDispensasiModal.jsx`, `RiwayatKelas.jsx`, `RiwayatKehadiran.jsx`, `Presensi.jsx`

**Bug Fixes:**
- **DashboardSiswa.jsx:** Memperbaiki error `Uncaught ReferenceError: CustomAlert is not defined` dengan menambahkan import yang hilang.
- **DashboardKelas.jsx:** Memperbaiki error `Identifier 'CustomAlert' has already been declared` dengan menghapus import duplikat.
