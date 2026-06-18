# TryoutPro — Platform Tryout Online

Aplikasi tryout online lengkap dengan Next.js frontend dan Laravel 12 backend.

## 📁 Struktur Folder

```
web-tryout/
├── frontend/          # Next.js 14 App Router + TailwindCSS + Zustand
└── backend/           # Laravel 12 + Sanctum + PostgreSQL
```

---

## 🚀 Cara Setup

### 1. Database (PostgreSQL)

Buat database baru di PostgreSQL:
```sql
CREATE DATABASE tryout_db;
```

---

### 2. Backend Laravel

```bash
cd backend

# Copy env (sudah dikonfigurasi)
# Edit .env — sesuaikan DB_USERNAME dan DB_PASSWORD

# Install dependencies
composer install

# Generate key (jika belum)
php artisan key:generate

# Jalankan migrasi dan seeder
php artisan migrate --seed

# Jalankan server
php artisan serve
# → http://localhost:8000
```

#### Akun Demo:
| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@tryoutpro.com      | password   |
| Peserta | peserta@demo.com         | password   |

---

### 3. Frontend Next.js

```bash
cd frontend

# Install dependencies (sudah dilakukan)
npm install

# Jalankan dev server
npm run dev
# → http://localhost:3000
```

---

## 🏗️ Teknologi

### Frontend
| Teknologi | Keterangan |
|-----------|-----------|
| Next.js 14 | App Router, TypeScript |
| TailwindCSS | Utility-first CSS |
| Zustand | State management |
| Axios | HTTP client |
| Lucide React | Icon library |
| React Hot Toast | Notifikasi |

### Backend
| Teknologi | Keterangan |
|-----------|-----------|
| Laravel 12 | PHP Framework |
| Sanctum | API authentication |
| PostgreSQL | Database |
| Repository Pattern | Abstraksi data access |
| Service Layer | Business logic |

---

## 📚 API Endpoints

### Auth
```
POST   /api/auth/register        Daftar akun baru
POST   /api/auth/login           Login
POST   /api/auth/logout          Logout (auth)
GET    /api/auth/me              Profile user (auth)
PUT    /api/auth/profile         Update profile (auth)
PUT    /api/auth/password        Ubah password (auth)
```

### Tryout
```
GET    /api/kategori             List kategori
GET    /api/paket                List paket (filter: status, kategori_id, search)
GET    /api/paket/{id}           Detail paket
```

### Ujian (Auth)
```
POST   /api/ujian/mulai          Mulai / resume sesi ujian
GET    /api/ujian/sesi/{id}      Load sesi aktif
POST   /api/ujian/sesi/{id}/jawaban    Simpan jawaban
PATCH  /api/ujian/sesi/{id}/sync-timer Sinkronisasi timer
POST   /api/ujian/sesi/{id}/submit     Submit ujian + penilaian otomatis
```

### Hasil & Leaderboard (Auth)
```
GET    /api/hasil                Riwayat ujian user
GET    /api/hasil/{id}           Detail hasil + rank
GET    /api/leaderboard          Leaderboard global (filter: paket_id)
GET    /api/dashboard/stats      Statistik dashboard
```

### Admin (Auth + Admin Role)
```
POST   /api/kategori             Buat kategori
PUT    /api/kategori/{id}        Update kategori
DELETE /api/kategori/{id}        Hapus kategori

POST   /api/soal                 Buat soal
GET    /api/soal                 List soal
PUT    /api/soal/{id}            Update soal
DELETE /api/soal/{id}            Hapus soal

POST   /api/paket                Buat paket
PUT    /api/paket/{id}           Update paket
DELETE /api/paket/{id}           Hapus paket
POST   /api/paket/{id}/soal      Tambah soal ke paket
DELETE /api/paket/{id}/soal/{sid} Hapus soal dari paket
```

---

## 📱 Halaman Frontend

| Halaman | URL | Keterangan |
|---------|-----|-----------|
| Landing | `/` | Landing page publik |
| Login | `/login` | Halaman login |
| Register | `/register` | Halaman daftar |
| Dashboard | `/dashboard` | Statistik peserta |
| Tryout | `/dashboard/tryout` | List paket tryout |
| Detail Paket | `/dashboard/tryout/[id]` | Info + mulai ujian |
| Halaman Ujian | `/ujian/[id]` | Full-screen exam |
| Hasil | `/dashboard/hasil/[id]` | Hasil & analisis |
| Riwayat | `/dashboard/riwayat` | Semua riwayat ujian |
| Leaderboard | `/dashboard/leaderboard` | Ranking peserta |
| Profil | `/dashboard/profil` | Edit profil & password |

---

## 🎨 Design System

- **Primary**: Blue 600 (`#2563eb`)
- **Font**: Inter (Google Fonts)
- **Radius**: 12–24px (rounded-xl, rounded-2xl)
- **Style**: Modern minimal, edu-tech, card-based
- **Theme**: Blue & White
- **Referensi**: Ruangguru, Zenius

---

## ✅ Fitur Lengkap

- [x] Authentication (Register/Login/Logout) dengan Sanctum
- [x] Dashboard peserta dengan statistik
- [x] Kategori & paket tryout
- [x] Halaman pengerjaan soal full-screen
- [x] Timer ujian real-time dengan auto-submit
- [x] Auto save jawaban (setiap pilih opsi)
- [x] Penilaian otomatis saat submit
- [x] Halaman hasil dengan analisis performa
- [x] Riwayat tryout
- [x] Leaderboard dengan podium Top 3
- [x] Profil peserta
- [x] Responsive mobile
- [x] Admin CRUD (kategori, soal, paket)
- [x] Seeder dummy data lengkap
- [x] Repository pattern + Service layer
- [x] CORS sudah dikonfigurasi
