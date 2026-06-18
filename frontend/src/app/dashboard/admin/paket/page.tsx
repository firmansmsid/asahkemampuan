'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Pencil, Trash2, X, Save, Link2, BookOpen, Clock, Target, Users, Shield, Globe, UserPlus, UserMinus, Upload, FileSpreadsheet, Download } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { PaketTryout, Kategori, Soal, User } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PaketForm {
  kategori_id: number | '';
  judul: string;
  deskripsi: string;
  durasi: number;
  jumlah_soal: number;
  passing_grade: number;
  is_gratis: boolean;
  harga: number;
  status: 'aktif' | 'nonaktif';
}

const emptyForm: PaketForm = {
  kategori_id: '', judul: '', deskripsi: '', durasi: 60, jumlah_soal: 20,
  passing_grade: 65, is_gratis: true, harga: 0, status: 'aktif',
};

export default function AdminPaketPage() {
  const [paketList, setPaketList] = useState<PaketTryout[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PaketForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Attach soal state
  const [attachPaketId, setAttachPaketId] = useState<number | null>(null);
  const [availableSoal, setAvailableSoal] = useState<Soal[]>([]);
  const [selectedSoalIds, setSelectedSoalIds] = useState<number[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);

  // Access control state
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessPaket, setAccessPaket] = useState<PaketTryout | null>(null);
  const [accessMode, setAccessMode] = useState<'publik' | 'terbatas'>('publik');
  const [allowedUsers, setAllowedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Import soal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPaketId, setImportPaketId] = useState<number | null>(null);
  const [importPaketName, setImportPaketName] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paketRes, katRes] = await Promise.all([
        apiClient.get('/paket'),
        apiClient.get('/kategori'),
      ]);
      setPaketList(paketRes.data.data);
      setKategoriList(katRes.data.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: PaketTryout) => {
    setEditId(p.id);
    setForm({
      kategori_id: p.kategori_id, judul: p.judul, deskripsi: p.deskripsi || '',
      durasi: p.durasi, jumlah_soal: p.jumlah_soal, passing_grade: p.passing_grade,
      is_gratis: p.is_gratis, harga: (p as any).harga || 0, status: p.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.kategori_id) return toast.error('Pilih kategori');
    if (!form.judul.trim()) return toast.error('Judul wajib diisi');

    setIsSaving(true);
    try {
      const payload = { ...form, kategori_id: Number(form.kategori_id) };
      if (editId) {
        await apiClient.put(`/paket/${editId}`, payload);
        toast.success('Paket diperbarui');
      } else {
        await apiClient.post('/paket', payload);
        toast.success('Paket dibuat');
      }
      setShowModal(false);
      fetchData();
    } catch {
      toast.error('Gagal menyimpan paket');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Yakin hapus paket "${judul}"?`)) return;
    try {
      await apiClient.delete(`/paket/${id}`);
      toast.success('Paket dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus paket');
    }
  };

  const openAttachSoal = async (paket: PaketTryout) => {
    setAttachPaketId(paket.id);
    setSelectedSoalIds([]);
    try {
      const res = await apiClient.get('/soal', { params: { kategori_id: paket.kategori_id } });
      setAvailableSoal(res.data.data || []);
      // Pre-select all soal from same kategori
      setSelectedSoalIds((res.data.data || []).map((s: Soal) => s.id));
    } catch {
      toast.error('Gagal memuat soal');
    }
    setShowAttachModal(true);
  };

  const toggleSoal = (id: number) => {
    setSelectedSoalIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAttachSoal = async () => {
    if (!attachPaketId || selectedSoalIds.length === 0) return toast.error('Pilih minimal 1 soal');
    setIsAttaching(true);
    try {
      await apiClient.post(`/paket/${attachPaketId}/soal`, { soal_ids: selectedSoalIds });
      toast.success(`${selectedSoalIds.length} soal berhasil ditautkan ke paket`);
      setShowAttachModal(false);
      fetchData();
    } catch {
      toast.error('Gagal menautkan soal');
    } finally {
      setIsAttaching(false);
    }
  };

  const openAccessModal = async (paket: PaketTryout) => {
    setAccessPaket(paket);
    setSelectedUserIds([]);
    try {
      const [accessRes, usersRes] = await Promise.all([
        apiClient.get(`/paket/${paket.id}/users`),
        apiClient.get('/admin/users', { params: { status: 'approved' } }),
      ]);
      setAccessMode(accessRes.data.access_mode);
      setAllowedUsers(accessRes.data.users);
      setAllUsers(usersRes.data.data.filter((u: User) => u.role !== 'admin'));
    } catch {
      toast.error('Gagal memuat data akses');
    }
    setShowAccessModal(true);
  };

  const handleToggleAccessMode = async (mode: 'publik' | 'terbatas') => {
    if (!accessPaket) return;
    try {
      await apiClient.post(`/paket/${accessPaket.id}/access`, { access_mode: mode });
      setAccessMode(mode);
      toast.success(`Mode akses: ${mode}`);
      fetchData();
    } catch {
      toast.error('Gagal mengubah mode akses');
    }
  };

  const handleAssignUsers = async () => {
    if (!accessPaket || selectedUserIds.length === 0) return;
    try {
      await apiClient.post(`/paket/${accessPaket.id}/users`, { user_ids: selectedUserIds });
      toast.success('Akses diberikan');
      const res = await apiClient.get(`/paket/${accessPaket.id}/users`);
      setAllowedUsers(res.data.users);
      setSelectedUserIds([]);
    } catch {
      toast.error('Gagal memberikan akses');
    }
  };

  const handleRevokeUser = async (userId: number) => {
    if (!accessPaket) return;
    try {
      await apiClient.delete(`/paket/${accessPaket.id}/users/${userId}`);
      setAllowedUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Akses dicabut');
    } catch {
      toast.error('Gagal mencabut akses');
    }
  };

  const getKategoriName = (id: number) =>
    kategoriList.find(k => k.id === id)?.nama || '-';

  const openImportModal = (paket: PaketTryout) => {
    setImportPaketId(paket.id);
    setImportPaketName(paket.judul);
    setImportFile(null);
    setShowImportModal(true);
  };

  const handleImport = async () => {
    if (!importFile || !importPaketId) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('paket_id', importPaketId.toString());
      const res = await apiClient.post('/soal-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message);
      setShowImportModal(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal import';
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/soal-template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_soal.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Gagal download template');
    }
  };

  return (
    <DashboardLayout title="Kelola Paket Tryout">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Paket Tryout</h2>
            <p className="text-sm text-slate-500">Kelola paket tryout dan hubungkan dengan soal</p>
          </div>
          <button onClick={openCreate} className="btn-md btn-primary">
            <Plus className="w-4 h-4" /> Buat Paket
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Tips:</strong> Klik tombol <strong>📥 Import</strong> pada paket untuk mengupload soal dari file Excel/CSV langsung ke paket tersebut. Soal otomatis tertaut ke paket.
          </p>
        </div>

        {/* Paket List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Memuat paket..." />
          </div>
        ) : paketList.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-3">Belum ada paket tryout</p>
            <button onClick={openCreate} className="btn-md btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Buat Paket Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paketList.map(paket => (
              <div key={paket.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 truncate">{paket.judul}</p>
                      <span className={cn('badge text-xs', paket.is_gratis ? 'badge-green' : 'badge-yellow')}>
                        {paket.is_gratis ? 'Gratis' : `Rp ${((paket as any).harga || 0).toLocaleString('id-ID')}`}
                      </span>
                      <span className={cn('badge text-xs', paket.status === 'aktif' ? 'badge-blue' : 'badge-gray')}>
                        {paket.status}
                      </span>
                      <span className={cn('badge text-xs', (paket as any).access_mode === 'terbatas' ? 'badge-red' : 'badge-gray')}>
                        {(paket as any).access_mode === 'terbatas' ? '🔒 Terbatas' : '🌐 Publik'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {getKategoriName(paket.kategori_id)}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {paket.soal_count ?? paket.jumlah_soal} soal</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {paket.durasi} menit</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {paket.peserta_count ?? 0} peserta</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openImportModal(paket)}
                      className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      title="Import Soal"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openAccessModal(paket)}
                      className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      title="Atur Akses"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openAttachSoal(paket)}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Tautkan Soal"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(paket)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(paket.id, paket.judul)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create/Edit Paket */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">{editId ? 'Edit Paket' : 'Buat Paket Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori *</label>
                <select value={form.kategori_id} onChange={e => setForm({ ...form, kategori_id: Number(e.target.value) })} className="input">
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Paket *</label>
                <input type="text" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Contoh: SKD CPNS Paket A" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi singkat..." className="input" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durasi (menit)</label>
                  <input type="number" value={form.durasi} onChange={e => setForm({ ...form, durasi: Number(e.target.value) })} min={5} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Soal</label>
                  <input type="number" value={form.jumlah_soal} onChange={e => setForm({ ...form, jumlah_soal: Number(e.target.value) })} min={1} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Passing Grade</label>
                  <input type="number" value={form.passing_grade} onChange={e => setForm({ ...form, passing_grade: Number(e.target.value) })} min={0} max={100} className="input" />
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_gratis} onChange={e => setForm({ ...form, is_gratis: e.target.checked, harga: e.target.checked ? 0 : form.harga })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-700">Gratis</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.status === 'aktif'} onChange={e => setForm({ ...form, status: e.target.checked ? 'aktif' : 'nonaktif' })} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-700">Aktif</span>
                </label>
              </div>
              {!form.is_gratis && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={form.harga}
                    onChange={e => setForm({ ...form, harga: Number(e.target.value) })}
                    min={0}
                    step={1000}
                    placeholder="50000"
                    className="input"
                  />
                  <p className="text-xs text-slate-400 mt-1">Format: angka tanpa titik. Contoh: 50000 = Rp 50.000</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleSave} disabled={isSaving} className="btn-md btn-primary flex-1">
                {isSaving ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Attach Soal */}
      {showAttachModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Tautkan Soal ke Paket</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSoalIds.length} dari {availableSoal.length} soal dipilih</p>
              </div>
              <button onClick={() => setShowAttachModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50 flex-shrink-0">
              <button
                onClick={() => setSelectedSoalIds(availableSoal.map(s => s.id))}
                className="text-xs text-blue-600 hover:underline font-medium"
              >Pilih Semua</button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setSelectedSoalIds([])}
                className="text-xs text-slate-500 hover:underline font-medium"
              >Batal Pilih</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {availableSoal.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-6">Tidak ada soal di kategori ini. Import soal terlebih dahulu.</p>
              ) : (
                availableSoal.map((soal, i) => (
                  <label key={soal.id} className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                    selectedSoalIds.includes(soal.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  )}>
                    <input
                      type="checkbox"
                      checked={selectedSoalIds.includes(soal.id)}
                      onChange={() => toggleSoal(soal.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        <span className="font-semibold text-slate-500">{i + 1}.</span>{' '}
                        {soal.pertanyaan.length > 100 ? soal.pertanyaan.substring(0, 100) + '...' : soal.pertanyaan}
                      </p>
                      <span className="badge badge-green text-xs mt-1">Jawaban: {soal.kunci_jawaban}</span>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setShowAttachModal(false)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleAttachSoal} disabled={isAttaching || selectedSoalIds.length === 0} className="btn-md btn-primary flex-1">
                {isAttaching ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Link2 className="w-4 h-4" />Tautkan {selectedSoalIds.length} Soal</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Access Control */}
      {showAccessModal && accessPaket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Atur Akses Paket</h3>
                <p className="text-xs text-slate-500 mt-0.5">{accessPaket.judul}</p>
              </div>
              <button onClick={() => setShowAccessModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Mode Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mode Akses</label>
                <div className="flex gap-3">
                  {([{key: 'publik' as const, label: '🌐 Publik', desc: 'Semua user bisa akses', icon: Globe},
                    {key: 'terbatas' as const, label: '🔒 Terbatas', desc: 'Hanya user tertentu', icon: Shield}]).map(m => (
                    <button
                      key={m.key}
                      onClick={() => handleToggleAccessMode(m.key)}
                      className={cn(
                        'flex-1 p-3 rounded-xl border-2 text-left transition-all',
                        accessMode === m.key
                          ? m.key === 'terbatas' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-xs mt-0.5 opacity-70">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* User assignment (only for terbatas) */}
              {accessMode === 'terbatas' && (
                <>
                  {/* Add users */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tambah User</label>
                    <div className="flex gap-2">
                      <select
                        multiple
                        value={selectedUserIds.map(String)}
                        onChange={e => setSelectedUserIds(Array.from(e.target.selectedOptions, o => Number(o.value)))}
                        className="input flex-1 min-h-[80px]"
                      >
                        {allUsers
                          .filter(u => !allowedUsers.find(au => au.id === u.id))
                          .map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                      </select>
                      <button
                        onClick={handleAssignUsers}
                        disabled={selectedUserIds.length === 0}
                        className="btn-md btn-primary self-end"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Ctrl+click untuk pilih beberapa user</p>
                  </div>

                  {/* Current allowed users */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      User dengan Akses ({allowedUsers.length})
                    </label>
                    {allowedUsers.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Belum ada user yang diberi akses</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {allowedUsers.map(u => (
                          <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                              <p className="text-xs text-slate-500 truncate">{u.email}</p>
                            </div>
                            <button
                              onClick={() => handleRevokeUser(u.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                              title="Cabut Akses"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setShowAccessModal(false)} className="btn-md btn-primary w-full">Selesai</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Soal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-600" /> Import Soal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ke paket: <strong>{importPaketName}</strong></p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Template download */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-700 mb-2">
                📋 Download template terlebih dahulu, isi dengan soal, lalu upload kembali.
              </p>
              <button onClick={handleDownloadTemplate} className="btn-md btn-secondary text-xs w-full">
                <Download className="w-4 h-4" /> Download Template CSV
              </button>
            </div>

            {/* File upload */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">File Excel / CSV</label>
              <label className={cn(
                'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all',
                importFile ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
              )}>
                {importFile ? (
                  <>
                    <FileSpreadsheet className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-700">{importFile.name}</p>
                    <p className="text-xs text-green-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Klik untuk pilih file</p>
                    <p className="text-xs text-slate-400">.xlsx, .xls, atau .csv (maks 5MB)</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Format info */}
            <div className="bg-slate-50 rounded-xl p-3 mb-5">
              <p className="text-xs text-slate-600 font-semibold mb-1">Format kolom:</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, kunci_jawaban (A-E), pembahasan, bobot
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowImportModal(false)} className="btn-md btn-ghost flex-1">Batal</button>
              <button
                onClick={handleImport}
                disabled={!importFile || isImporting}
                className="btn-md btn-primary flex-1"
              >
                {isImporting ? (
                  <><span className="spinner w-4 h-4" />Mengimport...</>
                ) : (
                  <><Upload className="w-4 h-4" />Import Soal</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
