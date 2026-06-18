'use client';

import { useEffect, useState } from 'react';
import {
  PenTool, Plus, Pencil, Trash2, X, Save, Search, Eye, EyeOff,
  CheckCircle, Clock, XCircle, AlertTriangle
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { Soal, Kategori } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import ImageUploadField from '@/components/ui/ImageUploadField';

interface SoalForm {
  kategori_id: number | '';
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  pilihan_e: string;
  kunci_jawaban: 'A' | 'B' | 'C' | 'D' | 'E';
  pembahasan: string;
  bobot: number;
}

const emptyForm: SoalForm = {
  kategori_id: '',
  pertanyaan: '',
  pilihan_a: '',
  pilihan_b: '',
  pilihan_c: '',
  pilihan_d: '',
  pilihan_e: '',
  kunci_jawaban: 'A',
  pembahasan: '',
  bobot: 1,
};

interface Stats {
  total: number;
  draft: number;
  verified: number;
  rejected: number;
}

export default function PembuatSoalPage() {
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'verified' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<SoalForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSoal, setExpandedSoal] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, draft: 0, verified: 0, rejected: 0 });

  // Image states
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  const [removeImages, setRemoveImages] = useState<Record<string, boolean>>({});
  const [existingImages, setExistingImages] = useState<Record<string, string | null>>({});

  const handleImageChange = (field: string, file: File | null) => {
    setImageFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleRemoveExistingImage = (field: string) => {
    setRemoveImages(prev => ({ ...prev, [field]: true }));
    setExistingImages(prev => ({ ...prev, [field]: null }));
  };

  const fetchKategori = async () => {
    try {
      const res = await apiClient.get('/kategori');
      setKategoriList(res.data.data);
    } catch { /* silent */ }
  };

  const fetchSoal = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await apiClient.get('/pembuat-soal/soal', { params });
      setSoalList(res.data.data || []);
      setStats(res.data.stats || { total: 0, draft: 0, verified: 0, rejected: 0 });
    } catch {
      toast.error('Gagal memuat soal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []);
  useEffect(() => { fetchSoal(); }, [statusFilter]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setImageFiles({});
    setRemoveImages({});
    setExistingImages({});
    setShowModal(true);
  };

  const openEdit = (s: Soal) => {
    if (s.verification_status === 'verified') {
      toast.error('Soal yang sudah terverifikasi tidak bisa diedit');
      return;
    }
    setEditId(s.id);
    setForm({
      kategori_id: s.kategori_id,
      pertanyaan: s.pertanyaan,
      pilihan_a: s.pilihan_a,
      pilihan_b: s.pilihan_b,
      pilihan_c: s.pilihan_c,
      pilihan_d: s.pilihan_d,
      pilihan_e: s.pilihan_e || '',
      kunci_jawaban: s.kunci_jawaban,
      pembahasan: s.pembahasan || '',
      bobot: s.bobot,
    });
    setImageFiles({});
    setRemoveImages({});
    setExistingImages({
      gambar_pertanyaan: s.gambar_pertanyaan || null,
      gambar_a: s.gambar_a || null,
      gambar_b: s.gambar_b || null,
      gambar_c: s.gambar_c || null,
      gambar_d: s.gambar_d || null,
      gambar_e: s.gambar_e || null,
      gambar_pembahasan: s.gambar_pembahasan || null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.kategori_id) return toast.error('Pilih kategori');
    if (!form.pertanyaan.trim()) return toast.error('Pertanyaan wajib diisi');
    if (!form.pilihan_a || !form.pilihan_b || !form.pilihan_c || !form.pilihan_d) {
      return toast.error('Pilihan A-D wajib diisi');
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('kategori_id', form.kategori_id.toString());
      formData.append('pertanyaan', form.pertanyaan);
      formData.append('pilihan_a', form.pilihan_a);
      formData.append('pilihan_b', form.pilihan_b);
      formData.append('pilihan_c', form.pilihan_c);
      formData.append('pilihan_d', form.pilihan_d);
      if (form.pilihan_e) formData.append('pilihan_e', form.pilihan_e);
      formData.append('kunci_jawaban', form.kunci_jawaban);
      if (form.pembahasan) formData.append('pembahasan', form.pembahasan);
      formData.append('bobot', form.bobot.toString());

      // Append images
      const fields = ['gambar_pertanyaan', 'gambar_a', 'gambar_b', 'gambar_c', 'gambar_d', 'gambar_e', 'gambar_pembahasan'];
      fields.forEach(f => {
        if (imageFiles[f]) formData.append(f, imageFiles[f] as File);
        if (removeImages[f]) formData.append(`remove_${f}`, '1');
      });

      if (editId) {
        formData.append('_method', 'PUT');
        await apiClient.post(`/pembuat-soal/soal/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Soal diperbarui & diajukan ulang');
      } else {
        await apiClient.post('/pembuat-soal/soal', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Soal berhasil diajukan');
      }
      setShowModal(false);
      fetchSoal();
    } catch {
      toast.error('Gagal menyimpan soal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus soal ini?')) return;
    try {
      await apiClient.delete(`/pembuat-soal/soal/${id}`);
      toast.success('Soal dihapus');
      fetchSoal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus soal');
    }
  };

  const filtered = soalList.filter(s =>
    s.pertanyaan.toLowerCase().includes(search.toLowerCase())
  );

  const getKategoriName = (id: number) =>
    kategoriList.find(k => k.id === id)?.nama || `Kategori #${id}`;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'draft':
        return <span className="badge badge-yellow"><Clock className="w-3 h-3" /> Menunggu Verifikasi</span>;
      case 'verified':
        return <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> Terverifikasi</span>;
      case 'rejected':
        return <span className="badge badge-red"><XCircle className="w-3 h-3" /> Ditolak</span>;
      default:
        return null;
    }
  };

  const pilihanLabels = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <DashboardLayout title="Soal Saya">
      <div className="max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Soal', value: stats.total, icon: PenTool, bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'Menunggu', value: stats.draft, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
            { label: 'Terverifikasi', value: stats.verified, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { label: 'Ditolak', value: stats.rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
          ].map((s, i) => (
            <div key={i} className={`card p-4 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
              <p className="font-bold text-2xl text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {(['all', 'draft', 'verified', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    statusFilter === f
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {f === 'all' ? 'Semua' : f === 'draft' ? `Pending (${stats.draft})` : f === 'verified' ? 'Verified' : 'Ditolak'}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari soal..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button onClick={openCreate} className="btn-md bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-200/50 flex items-center gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" /> Buat Soal
            </button>
          </div>
        </div>

        {/* Soal List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Memuat soal..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <PenTool className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-3">Belum ada soal</p>
            <p className="text-slate-400 text-sm mb-4">Mulai buat soal untuk mendapatkan komisi!</p>
            <button onClick={openCreate} className="btn-md bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all mx-auto">
              <Plus className="w-4 h-4" /> Buat Soal Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((soal, idx) => (
              <div key={soal.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                    soal.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                    soal.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-violet-100 text-violet-700'
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {soal.pertanyaan.length > 150 ? soal.pertanyaan.substring(0, 150) + '...' : soal.pertanyaan}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="badge badge-blue text-xs">{getKategoriName(soal.kategori_id)}</span>
                          {getStatusBadge(soal.verification_status)}
                          <span className="text-xs text-slate-400">Bobot: {soal.bobot}</span>
                        </div>
                        {/* Rejection note */}
                        {soal.verification_status === 'rejected' && soal.rejection_note && (
                          <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span><strong>Catatan Verifikator:</strong> {soal.rejection_note}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setExpandedSoal(expandedSoal === soal.id ? null : soal.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                          title="Detail"
                        >
                          {expandedSoal === soal.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        {soal.verification_status !== 'verified' && (
                          <>
                            <button
                              onClick={() => openEdit(soal)}
                              className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-600"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(soal.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {expandedSoal === soal.id && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
                        {pilihanLabels.map(label => {
                          const key = `pilihan_${label.toLowerCase()}` as keyof Soal;
                          const val = soal[key] as string;
                          if (!val) return null;
                          return (
                            <div key={label} className={cn(
                              'flex items-center gap-2 p-2 rounded-lg text-sm',
                              soal.kunci_jawaban === label ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-slate-50 text-slate-600'
                            )}>
                              <span className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                                soal.kunci_jawaban === label ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                              )}>{label}</span>
                              {val}
                            </div>
                          );
                        })}
                        {soal.pembahasan && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <span className="font-semibold">Pembahasan:</span> {soal.pembahasan}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create/Edit Soal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-slate-800 text-lg">
                {editId ? 'Edit & Ajukan Ulang Soal' : 'Buat Soal Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Info */}
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                <p className="text-xs text-violet-700">
                  ✍️ Soal yang Anda buat akan dikirim ke <strong>tim verifikator</strong> untuk direview sebelum bisa dimasukkan ke paket tryout.
                </p>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori *</label>
                <select
                  value={form.kategori_id}
                  onChange={e => setForm({ ...form, kategori_id: Number(e.target.value) })}
                  className="input"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pertanyaan *</label>
                <textarea
                  value={form.pertanyaan}
                  onChange={e => setForm({ ...form, pertanyaan: e.target.value })}
                  placeholder="Tulis pertanyaan soal..."
                  className="input mb-3"
                  rows={4}
                />
                <ImageUploadField
                  label="Gambar Pertanyaan (opsional)"
                  existingUrl={existingImages.gambar_pertanyaan}
                  file={imageFiles.gambar_pertanyaan}
                  onChange={file => handleImageChange('gambar_pertanyaan', file)}
                  onRemoveExisting={() => handleRemoveExistingImage('gambar_pertanyaan')}
                />
              </div>

              {/* Pilihan */}
              <div className="grid grid-cols-1 gap-4">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(label => {
                  const key = `pilihan_${label.toLowerCase()}` as keyof SoalForm;
                  const imgKey = `gambar_${label.toLowerCase()}`;
                  return (
                    <div key={label} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                      <div className="flex items-start gap-2">
                        <span className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer transition-colors mt-0.5',
                          form.kunci_jawaban === label
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-200'
                        )} onClick={() => setForm({ ...form, kunci_jawaban: label })} title={`Set ${label} sebagai jawaban benar`}>
                          {label}
                        </span>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={form[key] as string}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            placeholder={`Teks Pilihan ${label}${label === 'E' ? ' (opsional)' : ' *'}`}
                            className="input"
                          />
                          <ImageUploadField
                            label={`Gambar Pilihan ${label} (opsional)`}
                            existingUrl={existingImages[imgKey]}
                            file={imageFiles[imgKey]}
                            onChange={file => handleImageChange(imgKey, file)}
                            onRemoveExisting={() => handleRemoveExistingImage(imgKey)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-400 pl-2">💡 Klik huruf untuk set sebagai jawaban benar (sekarang: <strong>{form.kunci_jawaban}</strong>)</p>
              </div>

              {/* Bobot & Pembahasan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bobot</label>
                  <input
                    type="number"
                    value={form.bobot}
                    onChange={e => setForm({ ...form, bobot: Number(e.target.value) })}
                    min={1}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kunci Jawaban</label>
                  <select
                    value={form.kunci_jawaban}
                    onChange={e => setForm({ ...form, kunci_jawaban: e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' })}
                    className="input"
                  >
                    {['A', 'B', 'C', 'D', 'E'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pembahasan (opsional)</label>
                <textarea
                  value={form.pembahasan}
                  onChange={e => setForm({ ...form, pembahasan: e.target.value })}
                  placeholder="Tulis pembahasan jawaban..."
                  className="input mb-3"
                  rows={3}
                />
                <ImageUploadField
                  label="Gambar Pembahasan (opsional)"
                  existingUrl={existingImages.gambar_pembahasan}
                  file={imageFiles.gambar_pembahasan}
                  onChange={file => handleImageChange('gambar_pembahasan', file)}
                  onRemoveExisting={() => handleRemoveExistingImage('gambar_pembahasan')}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 flex gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleSave} disabled={isSaving} className="btn-md flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all">
                {isSaving ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Save className="w-4 h-4" />{editId ? 'Ajukan Ulang' : 'Kirim untuk Verifikasi'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
