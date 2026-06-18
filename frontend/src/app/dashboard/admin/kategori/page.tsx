'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, X, Save, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { Kategori } from '@/types';
import toast from 'react-hot-toast';

interface KategoriForm {
  nama: string;
  deskripsi: string;
}

const emptyForm: KategoriForm = { nama: '', deskripsi: '' };

export default function AdminKategoriPage() {
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KategoriForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchKategori = async () => {
    try {
      const res = await apiClient.get('/kategori');
      setKategoriList(res.data.data);
    } catch {
      toast.error('Gagal memuat kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (k: Kategori) => {
    setEditId(k.id);
    setForm({ nama: k.nama, deskripsi: k.deskripsi || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nama.trim()) return toast.error('Nama kategori wajib diisi');
    setIsSaving(true);
    try {
      if (editId) {
        await apiClient.put(`/kategori/${editId}`, form);
        toast.success('Kategori diperbarui');
      } else {
        await apiClient.post('/kategori', form);
        toast.success('Kategori ditambahkan');
      }
      setShowModal(false);
      fetchKategori();
    } catch {
      toast.error('Gagal menyimpan kategori');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin hapus kategori "${nama}"? Semua soal & paket di kategori ini mungkin terpengaruh.`)) return;
    try {
      await apiClient.delete(`/kategori/${id}`);
      toast.success('Kategori dihapus');
      fetchKategori();
    } catch {
      toast.error('Gagal menghapus kategori');
    }
  };

  return (
    <DashboardLayout title="Kelola Kategori">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Daftar Kategori</h2>
            <p className="text-sm text-slate-500">Kelola kategori soal tryout</p>
          </div>
          <button onClick={openCreate} className="btn-md btn-primary">
            <Plus className="w-4 h-4" /> Tambah Kategori
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Memuat kategori..." />
          </div>
        ) : kategoriList.length === 0 ? (
          <div className="card text-center py-12">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-3">Belum ada kategori</p>
            <button onClick={openCreate} className="btn-md btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Buat Kategori Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {kategoriList.map((k) => (
              <div key={k.id} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{k.nama}</p>
                  <p className="text-xs text-slate-500 truncate">{k.deskripsi || 'Tidak ada deskripsi'}</p>
                </div>
                {k.jumlah_paket !== undefined && (
                  <span className="badge badge-blue text-xs">{k.jumlah_paket} paket</span>
                )}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(k)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(k.id, k.nama)}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">
                {editId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Kategori</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: SKD CPNS"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsi singkat kategori..."
                  className="input"
                  rows={3}
                />
              </div>
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
    </DashboardLayout>
  );
}
