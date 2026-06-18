'use client';

import { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { LeaderboardEntry, PaketTryout } from '@/types';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

const demoData: LeaderboardEntry[] = Array.from({ length: 15 }, (_, i) => ({
  rank: i + 1,
  user: { id: i + 1, name: ['Budi Santoso', 'Ani Rahayu', 'Devi Kusuma', 'Rizky Pratama', 'Siti Nurhaliza', 'Ahmad Fauzi', 'Rina Wati', 'Hendra Gunawan', 'Maya Sari', 'Irfan Hakim', 'Putri Indah', 'Bagas Saputra', 'Laila Nuri', 'Dani Setiawan', 'Fika Amalia'][i], email: '', role: 'peserta', created_at: '', updated_at: '' },
  nilai: Math.max(40, 98 - i * 4 + Math.floor(Math.random() * 5)),
  durasi: 3600 + i * 240 + Math.floor(Math.random() * 300),
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
}));

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [paketList, setPaketList] = useState<PaketTryout[]>([]);
  const [selectedPaket, setSelectedPaket] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPaket]);

  const fetchData = async () => {
    try {
      const paketRes = await apiClient.get('/paket?status=aktif');
      setPaketList(paketRes.data.data);
    } catch {}
    await fetchLeaderboard();
    setIsLoading(false);
  };

  const fetchLeaderboard = async () => {
    try {
      const params = selectedPaket ? `?paket_id=${selectedPaket}` : '';
      const res = await apiClient.get(`/leaderboard${params}`);
      setEntries(res.data.data);
    } catch {
      setEntries(demoData);
    }
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-slate-500">#{rank}</span>;
  };

  const rankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
    return 'bg-white border-slate-100';
  };

  return (
    <DashboardLayout title="Leaderboard">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Leaderboard</h2>
          <p className="text-slate-500 text-sm">Peringkat peserta dengan nilai terbaik</p>
        </div>

        {/* Filter paket */}
        {paketList.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedPaket || ''}
              onChange={(e) => setSelectedPaket(e.target.value ? parseInt(e.target.value) : null)}
              className="input"
            >
              <option value="">Semua Paket</option>
              {paketList.map((p) => <option key={p.id} value={p.id}>{p.judul}</option>)}
            </select>
          </div>
        )}

        {/* Top 3 podium */}
        {!isLoading && entries.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {[entries[1], entries[0], entries[2]].map((entry, idx) => {
              const heights = ['h-24', 'h-32', 'h-20'];
              const podiumColors = ['bg-slate-200', 'bg-yellow-400', 'bg-amber-300'];
              const crowns = ['🥈', '🥇', '🥉'];
              return (
                <div key={entry.user.id} className="flex-1 max-w-[120px] flex flex-col items-center">
                  <div className="text-2xl mb-1">{crowns[idx]}</div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm mb-2 border-2 border-white shadow-lg">
                    {entry.user.name.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-slate-700 text-center leading-tight mb-1 truncate w-full px-1">{entry.user.name.split(' ')[0]}</p>
                  <p className="text-sm font-extrabold text-slate-800 mb-2">{entry.nilai}</p>
                  <div className={cn('w-full rounded-t-xl', heights[idx], podiumColors[idx])} />
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" label="Memuat leaderboard..." />
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={entry.user.id}
                className={cn('flex items-center gap-4 p-4 rounded-2xl border-2 transition-all animate-fade-in', rankBg(entry.rank))}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="w-8 flex-shrink-0 flex justify-center">
                  {rankIcon(entry.rank)}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {entry.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{entry.user.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(entry.durasi)}</span>
                  </div>
                </div>
                <div className={cn(
                  'px-3 py-1.5 rounded-xl font-bold text-sm',
                  entry.rank <= 3 ? 'bg-white shadow-sm' : 'bg-white/60'
                )}>
                  {entry.nilai}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
