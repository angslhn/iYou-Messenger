# 📱 iYou Messenger Web

> **Aplikasi Klien Mobile-First & PWA-Ready untuk Komunikasi Real-Time.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4A2B29?style=for-the-badge&logo=react&logoColor=white)

iYou Messenger adalah aplikasi web klien antarmuka yang dirancang secara khusus untuk memberikan pengalaman pengguna (UX) yang identik dengan aplikasi seluler Native (iOS/Android). Dibangun dengan fondasi filosofi Mobile-First, aplikasi ini tidak hanya tampil sangat ringan dan responsif, tetapi juga sepenuhnya dioptimalkan untuk navigasi sentuh (touch-friendly), tata letak layar vertikal, serta pengelolaan ruang visual yang cerdas saat berhadapan dengan elemen sistem seperti virtual keyboard maupun address bar peramban.

---

## ✨ Fitur Utama

### 📱 Pengalaman Native & PWA

- **PWA Standalone Mode:** Dapat diinstal di layar beranda HP melalui `site.webmanifest` dengan tampilan _full-screen_.
- **Viewport Fit Cover:** UI yang dioptimasi untuk perangkat dengan _notch_ (poni) seperti iPhone.
- **Anti-Bounce & Anti-Zoom:** Menghilangkan efek "memantul" saat scroll dan mencegah _zoom_ yang tidak diinginkan untuk menjaga konsistensi UI.
- **Smooth Bottom Sheets:** Interaksi menu dari bawah layar yang intuitif dengan sistem _scroll-locking_ pada latar belakang.

### ⚡ Performa & Manajemen State

- **Zustand Modular Stores:** State global yang terfragmentasi (Auth, Chat, Social, Alert) untuk performa _rendering_ yang optimal.
- **Smart Hydration:** Mencegah kedipan UI (_flickering_) saat memuat sesi pengguna dengan sinkronisasi antara _localStorage_ dan API.
- **Optimistic UI:** Aksi seperti mengirim pesan atau memberi reaksi muncul secara instan sebelum server memberikan konfirmasi, membuat aplikasi terasa sangat cepat.

### 🔌 WebSocket & Sinkronisasi

- **Robust Connection:** Wrapper WebSocket kustom dengan mekanisme _Exponential Backoff_ untuk _auto-reconnect_ saat sinyal tidak stabil.
- **Offline Queueing:** Pesan yang dikirim saat offline akan disimpan dalam antrean memori dan dikirim secara otomatis saat koneksi pulih.
- **Real-Time Feed:** Notifikasi story baru, permintaan pertemanan, dan pesan grup diperbarui secara instan tanpa muat ulang halaman.

### 🎨 UI/UX & Media Handling

- **OLED Dark Theme:** Tema `bg-night` yang elegan, dirancang untuk kenyamanan mata dan efisiensi baterai pada layar OLED.
- **In-App Image Cropper:** Fitur pemotongan gambar profil dan grup secara langsung di dalam aplikasi menggunakan `react-easy-crop`.
- **Pre-Flight Validation:** Validasi ukuran (maks 100MB) dan durasi video (maks 30s) dilakukan di sisi klien untuk menghemat kuota pengguna.

---

## 🛠️ Tech Stack

- **Framework:** React 18 (Vite).
- **Language:** TypeScript.
- **Styling:** Tailwind CSS.
- **State Management:** Zustand (Persist Middleware).
- **Routing:** React Router DOM v6.
- **Real-Time:** Native WebSocket API.
- **HTTP Client:** Axios (dengan Interceptor Global).

---
