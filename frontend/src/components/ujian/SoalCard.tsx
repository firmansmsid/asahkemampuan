'use client';

import { useUjianStore } from '@/store/ujianStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + '/storage/';

function SoalImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  if (!src) return null;
  const url = src.startsWith('http') ? src : `${STORAGE_URL}${src}`;
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white">
      <Image src={url} alt={alt} width={600} height={400} className="w-full h-auto max-h-72 object-contain" unoptimized />
    </div>
  );
}

interface SoalCardProps {
  sesiId: number;
}

export default function SoalCard({ sesiId }: SoalCardProps) {
  const { soalList, currentIndex, jawaban, saveJawaban } = useUjianStore();
  const soal = soalList[currentIndex];

  if (!soal) return null;

  const selectedAnswer = jawaban[soal.id];
  const optionLabels: Record<string, string> = {
    A: soal.pilihan_a,
    B: soal.pilihan_b,
    C: soal.pilihan_c,
    D: soal.pilihan_d,
    E: soal.pilihan_e,
  };
  const optionImages: Record<string, string | null | undefined> = {
    A: soal.gambar_a,
    B: soal.gambar_b,
    C: soal.gambar_c,
    D: soal.gambar_d,
    E: soal.gambar_e,
  };

  const handleSelect = async (opt: string) => {
    await saveJawaban(sesiId, soal.id, opt);
  };

  return (
    <div className="animate-fade-in">
      {/* Question number */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">
          {currentIndex + 1}
        </div>
        <div>
          <p className="text-xs font-medium text-blue-600">Soal {currentIndex + 1}</p>
          <p className="text-xs text-slate-400">dari {soalList.length} soal</p>
        </div>
      </div>

      {/* Question text + image */}
      <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100">
        <p className="text-slate-800 leading-relaxed text-sm font-medium whitespace-pre-wrap">
          {soal.pertanyaan}
        </p>
        <SoalImage src={soal.gambar_pertanyaan} alt="Gambar pertanyaan" />
      </div>

      {/* Options */}
      <div className="space-y-3">
        {OPTIONS.filter((opt) => optionLabels[opt]).map((opt) => {
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={cn(
                'w-full flex flex-col gap-1 p-4 rounded-xl border-2 text-left transition-all duration-200 group',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                  : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/50'
              )}
            >
              <div className="flex items-start gap-4 w-full">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all duration-200',
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                  )}
                >
                  {opt}
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed flex-1 pt-0.5 transition-colors',
                    isSelected ? 'text-blue-800 font-medium' : 'text-slate-700'
                  )}
                >
                  {optionLabels[opt]}
                </p>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {optionImages[opt] && (
                <div className="ml-11">
                  <SoalImage src={optionImages[opt]} alt={`Gambar pilihan ${opt}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
