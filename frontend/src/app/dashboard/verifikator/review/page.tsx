'use client';

import { useEffect, useState } from 'react';
import {
  CheckSquare, CheckCircle, XCircle, Clock, Search, Eye, EyeOff,
  AlertTriangle, User, ThumbsUp, ThumbsDown, X, Send
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/axios';
import { Soal } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
}

export default function VerifikatorReviewPage() {
  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [statusFilter, setStatusFilter] = useState<'draft' | 'verified' | 'rejected'>('draft');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSoal, setExpandedSoal] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({ pending: 0, verified: 0, rejected: 0 });
  const [rejectModal, setRejectModal] = useState<{ id: number; pertanyaan: string } | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSoal = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { status: statusFilter };
      if (search) params.search = search;
      const res = await apiClient.get('/verifikator/soal', { params });
      setSoalList(res.data.data || []);
      setStats(res.data.stats || { pending: 0, verified: 0, rejected: 0 });
    } catch {
      toast.error('Gagal memuat soal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSoal(); }, [statusFilter]);

  const handleApprove = async (id: number) => {
    if (!confirm('Yakin ingin menyetujui soal ini?')) return;
    setIsProcessing(true);
    try {
      await apiClient.post(`/verifikator/soal/${id}/approve`);
      toast.success('Soal berhasil diverifikasi!');
      fetchSoal();
    } catch {
      toast.error('Gagal memverifikasi soal');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (soal: Soal) => {
    setRejectModal({ id: soal.id, pertanyaan: soal.pertanyaan.substring(0, 100) + '...' });
    setRejectionNote('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectionNote.trim()) {
      toast.error('Catatan penolakan wajib diisi');
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.post(`/verifikator/soal/${rejectModal.id}/reject`, {
        rejection_note: rejectionNote,
      });
      toast.success('Soal ditolak');
      setRejectModal(null);
      fetchSoal();
    } catch {
      toast.error('Gagal menolak soal');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = soalList.filter(s =>
    s.pertanyaan.toLowerCase().includes(search.toLowerCase())
  );

  const pilihanLabels = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <DashboardLayout title="Verifikasi Soal">
      <div className="max-w-4xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Menunggu Review', value: stats.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
            { label: 'Disetujui', value: stats.verified, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { label: 'Ditolak', value: stats.rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
          ].map((s, i) => (
            <div key={i} className={`card p-4 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
              <p className="font-bold text-2xl text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-shrink-0">
              {(['draft', 'verified', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    statusFilter === f
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {f === 'draft' ? `Pending (${stats.pending})` : f === 'verified' ? 'Disetujui' : 'Ditolak'}
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
          </div>
        </div>

        {/* Soal List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Memuat soal..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {statusFilter === 'draft' ? 'Tidak ada soal menunggu verifikasi' : 'Tidak ada soal ditemukan'}
            </p>
            {statusFilter === 'draft' && (
              <p className="text-slate-400 text-sm mt-1">Semua soal sudah di-review 🎉</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((soal, idx) => (
              <div key={soal.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                    soal.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                    soal.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {soal.pertanyaan}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {soal.kategori && (
                            <span className="badge badge-blue text-xs">{soal.kategori.nama}</span>
                          )}
                          <span className="badge badge-green text-xs">Jawaban: {soal.kunci_jawaban}</span>
                          <span className="text-xs text-slate-400">Bobot: {soal.bobot}</span>
                        </div>
                        {/* Creator info */}
                        {soal.creator && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                            <User className="w-3 h-3" />
                            <span>Oleh: <strong>{soal.creator.name}</strong> ({soal.creator.email})</span>
                          </div>
                        )}
                        {/* Rejection note */}
                        {soal.verification_status === 'rejected' && soal.rejection_note && (
                          <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span><strong>Catatan Penolakan:</strong> {soal.rejection_note}</span>
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
                        {soal.verification_status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleApprove(soal.id)}
                              disabled={isProcessing}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Setujui"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(soal)}
                              disabled={isProcessing}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              title="Tolak"
                            >
                              <ThumbsDown className="w-4 h-4" />
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Tolak Soal
              </h3>
              <button onClick={() => setRejectModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Soal:</p>
                <p className="text-sm text-slate-700">{rejectModal.pertanyaan}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionNote}
                  onChange={e => setRejectionNote(e.target.value)}
                  placeholder="Jelaskan alasan penolakan agar pembuat soal bisa memperbaiki..."
                  className="input"
                  rows={4}
                  autoFocus
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setRejectModal(null)} className="btn-md btn-ghost flex-1">Batal</button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionNote.trim()}
                className="btn-md flex-1 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isProcessing ? <><span className="spinner w-4 h-4" />Menolak...</> : <><Send className="w-4 h-4" />Tolak Soal</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
