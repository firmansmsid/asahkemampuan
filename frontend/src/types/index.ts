// ============================================================
// AUTH
// ============================================================
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'peserta' | 'pembuat_soal' | 'verifikator';
  avatar?: string;
  is_approved?: boolean;
  approved_at?: string | null;
  account_expires_at?: string | null;
  account_expired?: boolean;
  days_until_expiry?: number | null;
  referral_code?: string;
  referral_commission_pct?: number;
  soal_commission_pct?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================================
// KATEGORI
// ============================================================
export interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string;
  icon?: string;
  jumlah_paket?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SOAL
// ============================================================
export interface Soal {
  id: number;
  kategori_id: number;
  pertanyaan: string;
  gambar_pertanyaan?: string | null;
  pilihan_a: string;
  gambar_a?: string | null;
  pilihan_b: string;
  gambar_b?: string | null;
  pilihan_c: string;
  gambar_c?: string | null;
  pilihan_d: string;
  gambar_d?: string | null;
  pilihan_e?: string;
  gambar_e?: string | null;
  kunci_jawaban: 'A' | 'B' | 'C' | 'D' | 'E';
  pembahasan?: string;
  gambar_pembahasan?: string | null;
  bobot: number;
  created_by?: number;
  verification_status?: 'draft' | 'verified' | 'rejected';
  verified_by?: number;
  verified_at?: string;
  rejection_note?: string;
  creator?: { id: number; name: string; email: string };
  verifier?: { id: number; name: string; email: string };
  kategori?: { id: number; nama: string; slug: string };
  created_at: string;
}

// ============================================================
// PAKET TRYOUT
// ============================================================
export interface PaketTryout {
  id: number;
  kategori_id: number;
  kategori?: Kategori;
  judul: string;
  slug: string;
  deskripsi: string;
  durasi: number; // menit
  jumlah_soal: number;
  passing_grade: number;
  is_gratis: boolean;
  harga: number;
  access_mode: 'publik' | 'terbatas';
  status: 'aktif' | 'nonaktif';
  thumbnail?: string;
  soal_count?: number;
  peserta_count?: number;
  has_access?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// UJIAN / SESI
// ============================================================
export interface SesiUjian {
  id: number;
  user_id: number;
  paket_id: number;
  paket?: PaketTryout;
  status: 'berlangsung' | 'selesai' | 'timeout';
  mulai_at: string;
  selesai_at?: string;
  waktu_tersisa: number; // detik
  jawaban?: JawabanUjian[];
  created_at: string;
}

export interface JawabanUjian {
  id?: number;
  sesi_id: number;
  soal_id: number;
  jawaban?: 'A' | 'B' | 'C' | 'D' | 'E';
  is_benar?: boolean;
}

// ============================================================
// HASIL
// ============================================================
export interface HasilTryout {
  id: number;
  sesi_id: number;
  user_id: number;
  paket_id: number;
  paket?: PaketTryout;
  user?: User;
  nilai: number;
  jumlah_benar: number;
  jumlah_salah: number;
  jumlah_kosong: number;
  durasi_pengerjaan: number; // detik
  lulus: boolean;
  rank?: number;
  created_at: string;
}

// ============================================================
// LEADERBOARD
// ============================================================
export interface LeaderboardEntry {
  rank: number;
  user: User;
  nilai: number;
  durasi: number;
  created_at: string;
}

// ============================================================
// API RESPONSE
// ============================================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
