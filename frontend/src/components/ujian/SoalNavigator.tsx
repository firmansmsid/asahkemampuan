'use client';

import { useUjianStore } from '@/store/ujianStore';
import { cn } from '@/lib/utils';

interface SoalNavigatorProps {
  sesiId: number;
}

export default function SoalNavigator({ sesiId }: SoalNavigatorProps) {
  const { soalList, jawaban, currentIndex, goToSoal } = useUjianStore();

  const answeredCount = Object.keys(jawaban).length;
  const progress = Math.round((answeredCount / soalList.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
          <span>Progress</span>
          <span>{answeredCount}/{soalList.length} soal</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span>Dijawab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400" />
          <span>Aktif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-slate-200" />
          <span>Belum</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto scrollbar-thin">
        {soalList.map((soal, index) => {
          const isAnswered = !!jawaban[soal.id];
          const isCurrent = index === currentIndex;

          return (
            <button
              key={soal.id}
              onClick={() => goToSoal(index)}
              className={cn(
                'soal-nav-btn text-xs',
                isCurrent
                  ? 'soal-nav-current'
                  : isAnswered
                  ? 'soal-nav-answered'
                  : 'soal-nav-empty'
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
