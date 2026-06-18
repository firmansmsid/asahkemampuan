'use client';

import { useEffect, useState } from 'react';
import {
  Users, CheckCircle, XCircle, Clock, Shield, UserCheck,
  Search, Plus, X, Save, Eye, EyeOff, Trash2, ToggleLeft, ToggleRight, BookOpen, Percent, Link2, PenTool, CheckSquare, Pencil, KeyRound, CalendarClock
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { User, PaketTryout } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'peserta' | 'pembuat_soal' | 'verifikator';
  paket_ids: number[];
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'peserta', paket_ids: [] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(User & { is_approved?: boolean; approved_at?: string })[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paketList, setPaketList] = useState<PaketTryout[]>([]);
  const [editingCommission, setEditingCommission] = useState<{ id: number; pct: string } | null>(null);
  const [editUser, setEditUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [resetPwUser, setResetPwUser] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [expiryEdit, setExpiryEdit] = useState<{ id: number; name: string; date: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter === 'pending') params.status = 'pending';
      if (filter === 'approved') params.status = 'approved';
      const res = await apiClient.get('/admin/users', { params });
      setUsers(res.data.data);
    } catch {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaket = async () => {
    try {
      const res = await apiClient.get('/paket');
      setPaketList(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchUsers(); }, [filter]);
  useEffect(() => { fetchPaket(); }, []);

  const handleApprove = async (id: number) => {
    try {
      await apiClient.post(`/admin/users/${id}/approve`);
      toast.success('User disetujui!');
      fetchUsers();
    } catch {
      toast.error('Gagal menyetujui user');
    }
  };

  const handleToggleActive = async (id: number, name: string, currentlyActive: boolean) => {
    const action = currentlyActive ? 'nonaktifkan' : 'aktifkan';
    if (!confirm(`Yakin ingin ${action} user "${name}"?`)) return;
    try {
      await apiClient.post(`/admin/users/${id}/toggle-active`);
      toast.success(`User berhasil di${action}`);
      fetchUsers();
    } catch {
      toast.error(`Gagal ${action} user`);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin HAPUS PERMANEN user "${name}"?\nSemua data ujian user ini juga akan terhapus.`)) return;
    try {
      await apiClient.delete(`/admin/users/${id}`);
      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch {
      toast.error('Gagal menghapus user');
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menolak & menghapus user "${name}"?`)) return;
    try {
      await apiClient.delete(`/admin/users/${id}/reject`);
      toast.success('User ditolak');
      fetchUsers();
    } catch {
      toast.error('Gagal menolak user');
    }
  };

  const handleUpdateCommission = async (userId: number, pct: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/commission`, { referral_commission_pct: parseFloat(pct) });
      toast.success('Komisi referral diperbarui');
      setEditingCommission(null);
      fetchUsers();
    } catch {
      toast.error('Gagal update komisi');
    }
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    setIsSavingEdit(true);
    try {
      await apiClient.put(`/admin/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
      });
      toast.success('User berhasil diperbarui');
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Gagal memperbarui user');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwUser || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setIsSavingEdit(true);
    try {
      await apiClient.post(`/admin/users/${resetPwUser.id}/reset-password`, { password: newPassword });
      toast.success(`Password ${resetPwUser.name} berhasil direset`);
      setResetPwUser(null);
      setNewPassword('');
    } catch {
      toast.error('Gagal mereset password');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUpdateExpiry = async () => {
    if (!expiryEdit) return;
    setIsSavingEdit(true);
    try {
      await apiClient.post(`/admin/users/${expiryEdit.id}/update-expiry`, { account_expires_at: expiryEdit.date });
      toast.success('Masa aktif berhasil diperbarui');
      setExpiryEdit(null);
      fetchUsers();
    } catch {
      toast.error('Gagal memperbarui masa aktif');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const togglePaketAccess = (paketId: number) => {
    setForm(prev => ({
      ...prev,
      paket_ids: prev.paket_ids.includes(paketId)
        ? prev.paket_ids.filter(id => id !== paketId)
        : [...prev.paket_ids, paketId],
    }));
  };

  const handleCreateUser = async () => {
    if (!form.name.trim()) return toast.error('Nama wajib diisi');
    if (!form.email.trim()) return toast.error('Email wajib diisi');
    if (!form.password || form.password.length < 6) return toast.error('Password minimal 6 karakter');

    setIsSaving(true);
    try {
      await apiClient.post('/admin/users', {
        ...form,
        paket_ids: form.paket_ids.length > 0 ? form.paket_ids : undefined,
      });
      toast.success('User berhasil ditambahkan!');
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      if (error.response?.data?.errors?.email) {
        toast.error('Email sudah digunakan');
      } else {
        toast.error('Gagal membuat user');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = users.filter(u => !u.is_approved).length;
  const restrictedPakets = paketList.filter((p: any) => p.access_mode === 'terbatas');

  return (
    <DashboardLayout title="Kelola Pengguna">
      <div className="max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total User', value: users.length, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'Menunggu', value: pendingCount, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
            { label: 'Disetujui', value: users.length - pendingCount, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className={`card p-4 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
              <p className="font-bold text-2xl text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter, Search & Add Button */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-shrink-0">
              {(['all', 'pending', 'approved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    filter === f
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {f === 'all' ? 'Semua' : f === 'pending' ? `Pending (${pendingCount})` : 'Disetujui'}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button onClick={openCreateModal} className="btn-md btn-primary flex-shrink-0">
              <Plus className="w-4 h-4" /> Tambah User
            </button>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Memuat pengguna..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(user => (
              <div key={user.id} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                  !user.is_approved ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                  user.role === 'admin'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                )}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'font-semibold text-sm truncate',
                      user.is_approved ? 'text-slate-800' : 'text-slate-400'
                    )}>{user.name}</p>
                    {user.role === 'admin' && (
                      <span className="badge badge-blue"><Shield className="w-3 h-3" /> Admin</span>
                    )}
                    {user.role === 'pembuat_soal' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-violet-100 text-violet-700 flex items-center gap-1 w-fit"><PenTool className="w-3 h-3" /> Pembuat Soal</span>
                    )}
                    {user.role === 'verifikator' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-100 text-teal-700 flex items-center gap-1 w-fit"><CheckSquare className="w-3 h-3" /> Verifikator</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  {/* Expiry info */}
                  {user.is_approved && (user as any).account_expires_at && (
                    <p className={cn('text-xs mt-0.5 flex items-center gap-1',
                      (user as any).account_expired ? 'text-red-500 font-semibold' :
                      ((user as any).days_until_expiry !== null && (user as any).days_until_expiry <= 30) ? 'text-amber-600' : 'text-slate-400'
                    )}>
                      <CalendarClock className="w-3 h-3" />
                      {(user as any).account_expired ? '⚠️ Kedaluwarsa' :
                       (user as any).days_until_expiry !== null ? `${(user as any).days_until_expiry} hari tersisa` : ''}
                      {' · '}{new Date((user as any).account_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  {user.role === 'peserta' && (user as any).referral_code && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                        <Link2 className="w-3 h-3" />{(user as any).referral_code}
                      </span>
                      {editingCommission?.id === user.id ? (
                        <span className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editingCommission.pct}
                            onChange={e => setEditingCommission({ ...editingCommission, pct: e.target.value })}
                            className="w-16 h-6 text-xs border rounded px-1 text-center"
                            min={0} max={100} step={0.5}
                          />
                          <span className="text-xs text-slate-400">%</span>
                          <button onClick={() => handleUpdateCommission(user.id, editingCommission.pct)} className="text-emerald-600 hover:text-emerald-700"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingCommission(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-3.5 h-3.5" /></button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setEditingCommission({ id: user.id, pct: String((user as any).referral_commission_pct ?? 10) })}
                          className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md hover:bg-amber-100 flex items-center gap-1"
                        >
                          <Percent className="w-3 h-3" />{(user as any).referral_commission_pct ?? 10}%
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {user.is_approved ? (
                    <>
                      <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> Aktif</span>
                      <button onClick={() => handleToggleActive(user.id, user.name, true)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Nonaktifkan"><ToggleRight className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <span className="badge badge-yellow"><Clock className="w-3 h-3" /> {user.approved_at === null ? 'Nonaktif' : 'Pending'}</span>
                      <button onClick={() => user.approved_at === null ? handleToggleActive(user.id, user.name, false) : handleApprove(user.id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Aktifkan">{user.approved_at === null ? <ToggleLeft className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}</button>
                    </>
                  )}
                  <button onClick={() => setEditUser({ id: user.id, name: user.name, email: user.email, role: user.role })} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit User"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { setResetPwUser({ id: user.id, name: user.name }); setNewPassword(''); setShowNewPw(false); }} className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                  <button onClick={() => { const current = (user as any).account_expires_at ? new Date((user as any).account_expires_at).toISOString().split('T')[0] : new Date(Date.now() + 365*86400000).toISOString().split('T')[0]; setExpiryEdit({ id: user.id, name: user.name, date: current }); }} className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors" title="Atur Masa Aktif"><CalendarClock className="w-4 h-4" /></button>
                  {user.role !== 'admin' && (
                    <button onClick={() => handleDelete(user.id, user.name)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Hapus Permanen"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Tambah User Baru</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="user@email.com"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['peserta', 'admin', 'pembuat_soal', 'verifikator'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={cn(
                        'py-3 rounded-xl text-sm font-semibold transition-all border-2',
                        form.role === role
                          ? role === 'admin'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : role === 'pembuat_soal'
                              ? 'bg-violet-50 border-violet-500 text-violet-700'
                              : role === 'verifikator'
                                ? 'bg-teal-50 border-teal-500 text-teal-700'
                                : 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {role === 'admin' ? '🛡️ Admin' : role === 'peserta' ? '👤 Peserta' : role === 'pembuat_soal' ? '✍️ Pembuat Soal' : '✅ Verifikator'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paket Access */}
              {form.role === 'peserta' && paketList.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Akses Paket Tryout
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Pilih paket yang bisa diakses user ini. Paket publik otomatis bisa diakses semua user.
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3">
                    {paketList.map((paket: any) => {
                      const isRestricted = paket.access_mode === 'terbatas';
                      return (
                        <label
                          key={paket.id}
                          className={cn(
                            'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border',
                            form.paket_ids.includes(paket.id)
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-slate-100 hover:bg-slate-50',
                            !isRestricted && 'opacity-60'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={form.paket_ids.includes(paket.id)}
                            onChange={() => togglePaketAccess(paket.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{paket.judul}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn('text-xs', isRestricted ? 'text-red-500 font-medium' : 'text-slate-400')}>
                                {isRestricted ? '🔒 Terbatas' : '🌐 Publik'}
                              </span>
                              <span className="text-xs text-slate-400">{paket.jumlah_soal} soal</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {restrictedPakets.length > 0 && form.paket_ids.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      ⚠️ Ada {restrictedPakets.length} paket terbatas. User tidak akan bisa mengakses paket terbatas tanpa di-assign.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-3 mt-4 border border-blue-100">
              <p className="text-xs text-blue-700">
                ℹ️ User yang dibuat oleh admin otomatis <strong>aktif</strong> tanpa perlu persetujuan.
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleCreateUser} disabled={isSaving} className="btn-md btn-primary flex-1">
                {isSaving ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Save className="w-4 h-4" />Buat User</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama</label>
                <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['peserta', 'admin', 'pembuat_soal', 'verifikator'] as const).map(role => (
                    <button key={role} type="button" onClick={() => setEditUser({ ...editUser, role })} className={cn('py-2 rounded-xl text-sm font-semibold transition-all border-2', editUser.role === role ? role === 'admin' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : role === 'pembuat_soal' ? 'bg-violet-50 border-violet-500 text-violet-700' : role === 'verifikator' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')}>
                      {role === 'admin' ? '🛡️ Admin' : role === 'peserta' ? '👤 Peserta' : role === 'pembuat_soal' ? '✍️ Pembuat Soal' : '✅ Verifikator'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditUser(null)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleEditUser} disabled={isSavingEdit} className="btn-md btn-primary flex-1">
                {isSavingEdit ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetPwUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><KeyRound className="w-5 h-5 text-orange-500" />Reset Password</h3>
              <button onClick={() => setResetPwUser(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-sm text-orange-800">Reset password untuk: <strong>{resetPwUser.name}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="input pr-10" autoFocus />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setResetPwUser(null)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleResetPassword} disabled={isSavingEdit || newPassword.length < 6} className="btn-md flex-1 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50">
                {isSavingEdit ? <><span className="spinner w-4 h-4" />Mereset...</> : <><KeyRound className="w-4 h-4" />Reset Password</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atur Masa Aktif */}
      {expiryEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><CalendarClock className="w-5 h-5 text-purple-500" />Atur Masa Aktif</h3>
              <button onClick={() => setExpiryEdit(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-sm text-purple-800">User: <strong>{expiryEdit.name}</strong></p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Berakhir</label>
              <input type="date" value={expiryEdit.date} onChange={e => setExpiryEdit({ ...expiryEdit, date: e.target.value })} className="input" min={new Date().toISOString().split('T')[0]} />
              <p className="text-xs text-slate-400 mt-1.5">Akun user akan aktif hingga tanggal yang dipilih. Setelah itu, user masih bisa login tetapi tidak bisa akses materi.</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setExpiryEdit(null)} className="btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleUpdateExpiry} disabled={isSavingEdit || !expiryEdit.date} className="btn-md flex-1 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50">
                {isSavingEdit ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
