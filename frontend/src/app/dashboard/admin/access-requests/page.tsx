'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, Clock, User, BookOpen, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AccessRequest {
  id: number;
  user_id: number;
  paket_id: number;
  pesan: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  user: { id: number; name: string; email: string };
  paket: { id: number; judul: string; kategori?: { nama: string } };
}

export default function AdminAccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter !== 'all') params.status = filter;
      const res = await apiClient.get('/admin/access-requests', { params });
      setRequests(res.data.data);
      setPendingCount(res.data.meta?.pending_count ?? 0);
    } catch {
      toast.error('Gagal memuat permintaan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id: number) => {
    try {
      await apiClient.post(`/admin/access-requests/${id}/approve`);
      toast.success('Permintaan disetujui! User sekarang bisa mengakses paket.');
      fetchRequests();
    } catch {
      toast.error('Gagal menyetujui');
    }
  };

  const handleReject = async (id: number) => {
    const note = prompt('Alasan penolakan (opsional):');
    try {
      await apiClient.post(`/admin/access-requests/${id}/reject`, { admin_note: note });
      toast.success('Permintaan ditolak');
      fetchRequests();
    } catch {
      toast.error('Gagal menolak');
    }
  };

  const statusConfig = {
    pending: { label: 'Menunggu', color: 'badge-yellow', icon: Clock },
    approved: { label: 'Disetujui', color: 'badge-green', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'badge-red', icon: XCircle },
  };

  return (
    <DashboardLayout title="Permintaan Akses">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Permintaan Akses Paket
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500">Kelola permintaan akses paket tryout dari pengguna</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'pending' as const, label: `Pending (${pendingCount})` },
            { key: 'approved' as const, label: 'Disetujui' },
            { key: 'rejected' as const, label: 'Ditolak' },
            { key: 'all' as const, label: 'Semua' },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Memuat permintaan..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {filter === 'pending' ? 'Tidak ada permintaan menunggu' : 'Tidak ada data'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const sc = statusConfig[req.status];
              return (
                <div key={req.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {req.user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">{req.user.name}</p>
                        <span className="text-xs text-slate-400">({req.user.email})</span>
                        <span className={`badge text-xs ${sc.color}`}>
                          <sc.icon className="w-3 h-3" /> {sc.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm text-slate-700 font-medium">{req.paket.judul}</span>
                        {req.paket.kategori && (
                          <span className="badge badge-blue text-xs">{req.paket.kategori.nama}</span>
                        )}
                      </div>

                      {req.pesan && (
                        <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-2 mb-2">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-600 italic">{req.pesan}</p>
                        </div>
                      )}

                      <p className="text-xs text-slate-400">
                        {new Date(req.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Setujui"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Tolak"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
