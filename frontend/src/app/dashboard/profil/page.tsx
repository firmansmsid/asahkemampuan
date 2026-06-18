'use client';

import { useState } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilPage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error('Nama tidak boleh kosong');
    setIsSavingName(true);
    try {
      const res = await apiClient.put('/auth/profile', { name });
      setUser(res.data.data);
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!password.current || !password.new || !password.confirm)
      return toast.error('Semua field password wajib diisi');
    if (password.new.length < 8)
      return toast.error('Password baru minimal 8 karakter');
    if (password.new !== password.confirm)
      return toast.error('Konfirmasi password tidak cocok');
    setIsSavingPass(true);
    try {
      await apiClient.put('/auth/password', {
        current_password: password.current,
        password: password.new,
        password_confirmation: password.confirm,
      });
      toast.success('Password berhasil diubah');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingPass(false);
    }
  };

  return (
    <DashboardLayout title="Profil">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Profil Saya</h2>

        {/* Avatar */}
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="badge badge-blue mt-1 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Edit Name */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Informasi Akun</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={user?.email || ''} disabled className="input pl-10 bg-slate-50 cursor-not-allowed" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah</p>
            </div>
            <button onClick={handleSaveName} disabled={isSavingName} className="btn-md btn-primary w-full">
              {isSavingName ? <><span className="spinner w-4 h-4" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Perubahan</>}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Ubah Password</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: 'current', label: 'Password Saat Ini', placeholder: 'Masukkan password lama' },
              { key: 'new', label: 'Password Baru', placeholder: 'Minimal 8 karakter' },
              { key: 'confirm', label: 'Konfirmasi Password Baru', placeholder: 'Ulangi password baru' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password[key as keyof typeof password]}
                    onChange={(e) => setPassword((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={isSavingPass} className="btn-md btn-primary w-full">
              {isSavingPass ? <><span className="spinner w-4 h-4" />Mengubah...</> : <><Save className="w-4 h-4" />Ubah Password</>}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
