'use client';

import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function Topbar({ onMenuToggle, title }: TopbarProps) {
  const { user } = useAuthStore();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        {title && (
          <h1 className="font-semibold text-slate-800 text-base hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-scale-in">
              <p className="font-semibold text-slate-800 mb-3 text-sm">Notifikasi</p>
              <div className="space-y-3">
                {[
                  { msg: 'Hasil tryout SKD tersedia', time: '5 menit lalu' },
                  { msg: 'Paket UTBK baru telah ditambahkan', time: '2 jam lalu' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">{n.msg}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || 'peserta'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
