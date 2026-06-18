'use client';

import { useState, useEffect } from 'react';
import { MessageSquareQuote, Plus, Pencil, Trash2, X } from 'lucide-react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

interface Testimoni {
  id: number;
  name: string;
  role: string | null;
  content: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminTestimoni() {
  const [testimoniList, setTestimoniList] = useState<Testimoni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', role: '', content: '', is_active: true });
  const [isSaving, setIsSaving] = useState(false);

  const fetchTestimoni = async () => {
    try {
      const res = await apiClient.get('/admin/testimoni');
      setTestimoniList(res.data.data);
    } catch {
      toast.error('Gagal memuat data testimoni');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimoni();
  }, []);



  const openModal = (testi?: Testimoni) => {
    if (testi) {
      setEditId(testi.id);
      setForm({ name: testi.name, role: testi.role || '', content: testi.content, is_active: testi.is_active });
    } else {
      setEditId(null);
      setForm({ name: '', role: '', content: '', is_active: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editId) {
        await apiClient.put(`/admin/testimoni/${editId}`, form);
        toast.success('Testimoni berhasil diperbarui');
      } else {
        await apiClient.post('/admin/testimoni', form);
        toast.success('Testimoni berhasil ditambahkan');
      }
      closeModal();
      fetchTestimoni();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;
    try {
      await apiClient.delete(`/admin/testimoni/${id}`);
      toast.success('Testimoni berhasil dihapus');
      fetchTestimoni();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) return <div className="p-8 text-center"><span className="spinner w-8 h-8 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-blue-600" /> Kelola Testimoni
          </h1>
          <p className="text-slate-500 mt-1">Atur testimoni dari pengguna untuk ditampilkan di Landing Page.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="btn-md bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 border-0"
        >
          <Plus className="w-4 h-4" /> Tambah Testimoni
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Role / Instansi</th>
                <th className="p-4 font-semibold w-1/3">Isi Testimoni</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {testimoniList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Belum ada data testimoni
                  </td>
                </tr>
              ) : (
                testimoniList.map((testi) => (
                  <tr key={testi.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">{testi.name}</td>
                    <td className="p-4 text-slate-600">{testi.role || '-'}</td>
                    <td className="p-4 text-slate-600 line-clamp-2" title={testi.content}>{testi.content}</td>
                    <td className="p-4">
                      {testi.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">Sembunyi</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openModal(testi)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(testi.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editId ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="input w-full" 
                  placeholder="Nama Pengguna"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role / Instansi</label>
                <input 
                  type="text" 
                  value={form.role} 
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="input w-full" 
                  placeholder="Misal: PNS Kementrian Agama"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Isi Testimoni</label>
                <textarea 
                  value={form.content} 
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={4}
                  className="input w-full py-2" 
                  placeholder="Pesan testimoni..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={form.is_active} 
                  onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Tampilkan di Landing Page</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors flex items-center gap-2">
                  {isSaving && <span className="spinner w-4 h-4" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
