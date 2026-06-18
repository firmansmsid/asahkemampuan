import Link from 'next/link';
import { Clock, Users, ChevronRight, Lock, ShieldAlert } from 'lucide-react';
import { PaketTryout } from '@/types';
import { cn } from '@/lib/utils';

interface PaketCardProps {
  paket: PaketTryout & { has_access?: boolean };
  className?: string;
}

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  default: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  cpns: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  utbk: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  skd: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  toefl: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
};

export default function PaketCard({ paket, className }: PaketCardProps) {
  const slug = paket.kategori?.slug || 'default';
  const colors = categoryColors[slug] || categoryColors.default;
  const hasAccess = paket.has_access !== false; // default true if not set

  const cardContent = (
    <div className={cn(
      'card-hover group relative overflow-hidden',
      !hasAccess && 'opacity-75',
      className
    )}>
      {/* Header bar */}
      <div className={cn(
        'h-1.5 -mx-6 -mt-6 mb-5 rounded-t-2xl',
        hasAccess
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
          : 'bg-gradient-to-r from-slate-300 to-slate-400'
      )} />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('badge', colors.bg, colors.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
              {paket.kategori?.nama || 'Umum'}
            </span>
            {paket.is_gratis ? (
              <span className="badge badge-green">Gratis</span>
            ) : (
              <span className="badge badge-blue flex items-center gap-1">
                <Lock className="w-3 h-3" />Premium
              </span>
            )}
            {!hasAccess && (
              <span className="badge bg-red-100 text-red-600 flex items-center gap-1">
                <Lock className="w-3 h-3" />Terkunci
              </span>
            )}
          </div>
          <h3 className={cn(
            'font-bold text-sm leading-snug line-clamp-2 transition-colors',
            hasAccess ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-500'
          )}>
            {paket.judul}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{paket.deskripsi}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-4">
        <div className="text-center">
          <p className="text-base font-bold text-slate-800">{paket.jumlah_soal}</p>
          <p className="text-xs text-slate-500">Soal</p>
        </div>
        <div className="text-center border-x border-slate-100">
          <p className="text-base font-bold text-slate-800 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />{paket.durasi}
          </p>
          <p className="text-xs text-slate-500">Menit</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-800">{paket.passing_grade}</p>
          <p className="text-xs text-slate-500">Min. Nilai</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5" />
          <span>{paket.peserta_count ?? 0} peserta</span>
        </div>
        {hasAccess ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 group/link">
            Mulai
            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
            <ShieldAlert className="w-3.5 h-3.5" />
            Butuh Akses
          </span>
        )}
      </div>

      {/* Locked overlay notice */}
      {!hasAccess && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-2xl flex items-end justify-center pointer-events-none">
          <div className="bg-slate-800/90 text-white text-center px-4 py-2.5 rounded-b-2xl w-full">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Akses Terbatas</span>
            </div>
            <p className="text-[10px] text-slate-300">Hubungi admin untuk mendapatkan akses</p>
          </div>
        </div>
      )}
    </div>
  );

  if (hasAccess) {
    return (
      <Link href={`/dashboard/tryout/${paket.id}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
