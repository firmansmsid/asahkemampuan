'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Trophy, Clock, LogOut,
  User, ChevronRight, GraduationCap, Star, X,
  ShieldCheck, FolderOpen, FileQuestion, Users, Bell,
  Share2, DollarSign, PenTool, CheckSquare, Wallet, Layout, MessageSquareQuote
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const pesertaNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null as string | null },
  { href: '/dashboard/tryout', label: 'Kategori Tryout', icon: BookOpen, badgeKey: null as string | null },
  { href: '/dashboard/riwayat', label: 'Riwayat Ujian', icon: Clock, badgeKey: null as string | null },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy, badgeKey: null as string | null },
  { href: '/dashboard/referral', label: 'Referral & Komisi', icon: Share2, badgeKey: null as string | null },
  { href: '/dashboard/profil', label: 'Profil', icon: User, badgeKey: null as string | null },
];

const adminNav = [
  { href: '/dashboard/admin/users', label: 'Kelola Pengguna', icon: Users, badgeKey: 'pending_users' as const },
  { href: '/dashboard/admin/kategori', label: 'Kelola Kategori', icon: FolderOpen, badgeKey: null },
  { href: '/dashboard/admin/soal', label: 'Kelola Soal', icon: FileQuestion, badgeKey: null },
  { href: '/dashboard/admin/paket', label: 'Kelola Paket', icon: BookOpen, badgeKey: null },
  { href: '/dashboard/admin/access-requests', label: 'Permintaan Akses', icon: Bell, badgeKey: 'pending_requests' as const },
  { href: '/dashboard/admin/keuangan', label: 'Keuangan', icon: DollarSign, badgeKey: null },
  { href: '/dashboard/admin/landing', label: 'Landing Page', icon: Layout, badgeKey: null },
  { href: '/dashboard/admin/testimoni', label: 'Testimoni', icon: MessageSquareQuote, badgeKey: null },
];

const pembuatSoalNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null as string | null },
  { href: '/dashboard/pembuat-soal/soal', label: 'Soal Saya', icon: PenTool, badgeKey: null as string | null },
  { href: '/dashboard/pembuat-soal/komisi', label: 'Komisi Saya', icon: Wallet, badgeKey: null as string | null },
  { href: '/dashboard/profil', label: 'Profil', icon: User, badgeKey: null as string | null },
];

const verifikatorNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null as string | null },
  { href: '/dashboard/verifikator/review', label: 'Verifikasi Soal', icon: CheckSquare, badgeKey: 'pending_soal' as string | null },
  { href: '/dashboard/profil', label: 'Profil', icon: User, badgeKey: null as string | null },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isPembuatSoal = user?.role === 'pembuat_soal';
  const isVerifikator = user?.role === 'verifikator';
  const [notifCounts, setNotifCounts] = useState<Record<string, number>>({});

  const fetchNotifCounts = useCallback(async () => {
    if (!isAdmin && !isVerifikator) return;
    try {
      if (isAdmin) {
        const res = await apiClient.get('/admin/notifications');
        setNotifCounts(res.data.data);
      } else if (isVerifikator) {
        // Fetch pending soal count for verifikator
        const res = await apiClient.get('/verifikator/soal?status=draft');
        setNotifCounts({ pending_soal: res.data.stats?.pending || 0 });
      }
    } catch { /* silent */ }
  }, [isAdmin, isVerifikator]);

  useEffect(() => {
    fetchNotifCounts();
    const interval = setInterval(fetchNotifCounts, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchNotifCounts]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil logout');
      router.push('/login');
    } catch {
      toast.error('Gagal logout');
    }
  };

  // Determine which nav items to show based on role
  const getMainNav = () => {
    if (isPembuatSoal) return pembuatSoalNav;
    if (isVerifikator) return verifikatorNav;
    return pesertaNav;
  };

  const mainNav = getMainNav();

  // Role badge info
  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Mode Admin', sublabel: 'Akun aktif', bg: 'bg-indigo-50 border-indigo-100', icon: <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />, textColor: 'text-indigo-700', subTextColor: 'text-indigo-600' };
    if (isPembuatSoal) return { label: 'Pembuat Soal', sublabel: 'Akun aktif', bg: 'bg-violet-50 border-violet-100', icon: <PenTool className="w-4 h-4 text-violet-500 flex-shrink-0" />, textColor: 'text-violet-700', subTextColor: 'text-violet-600' };
    if (isVerifikator) return { label: 'Verifikator', sublabel: 'Akun aktif', bg: 'bg-teal-50 border-teal-100', icon: <CheckSquare className="w-4 h-4 text-teal-500 flex-shrink-0" />, textColor: 'text-teal-700', subTextColor: 'text-teal-600' };
    return { label: 'Mode Peserta', sublabel: 'Akun aktif', bg: 'bg-amber-50 border-amber-100', icon: <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />, textColor: 'text-amber-700', subTextColor: 'text-amber-600' };
  };

  const roleBadge = getRoleBadge();

  // Active style colors based on role
  const getActiveColor = () => {
    if (isPembuatSoal) return { active: 'bg-violet-600 text-white shadow-lg shadow-violet-500/25', hover: 'text-slate-600 hover:bg-violet-50 hover:text-violet-600' };
    if (isVerifikator) return { active: 'bg-teal-600 text-white shadow-lg shadow-teal-500/25', hover: 'text-slate-600 hover:bg-teal-50 hover:text-teal-600' };
    return { active: 'bg-blue-600 text-white shadow-lg shadow-blue-500/25', hover: 'text-slate-600 hover:bg-blue-50 hover:text-blue-600' };
  };

  const activeColor = getActiveColor();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-30 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm leading-tight tracking-tight">Asah<span className="text-blue-600">Kemampuan</span></p>
              <p className="text-xs text-slate-400">Platform Ujian</p>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        {/* User info */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{user?.name || 'Peserta'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">Menu</p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            const isExactDashboard = item.href === '/dashboard' && pathname === '/dashboard';
            const active = item.href === '/dashboard' ? isExactDashboard : isActive;
            const badgeCount = item.badgeKey ? (notifCounts[item.badgeKey] || 0) : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-150 group',
                  active ? activeColor.active : activeColor.hover
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                <span className="text-sm flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className={cn(
                    'min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold px-1.5',
                    active ? 'bg-white/25 text-white' : 'bg-red-500 text-white animate-pulse'
                  )}>
                    {badgeCount}
                  </span>
                )}
                {active && badgeCount === 0 && <ChevronRight className="w-4 h-4 opacity-70" />}
              </Link>
            );
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Admin Panel
                </p>
              </div>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const badgeCount = item.badgeKey ? (notifCounts[item.badgeKey] || 0) : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                    )}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                    <span className="text-sm flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className={cn(
                        'min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold px-1.5',
                        isActive ? 'bg-white/25 text-white' : 'bg-red-500 text-white animate-pulse'
                      )}>
                        {badgeCount}
                      </span>
                    )}
                    {isActive && badgeCount === 0 && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 mb-3 rounded-xl border',
            roleBadge.bg
          )}>
            {roleBadge.icon}
            <div>
              <p className={cn('text-xs font-semibold', roleBadge.textColor)}>
                {roleBadge.label}
              </p>
              <p className={cn('text-xs', roleBadge.subTextColor)}>{roleBadge.sublabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all duration-150 text-sm"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
