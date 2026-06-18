'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useUjianStore } from '@/store/ujianStore';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/axios';

interface TimerProps {
  sesiId: number;
  onTimeUp: () => void;
}

export default function Timer({ sesiId, onTimeUp }: TimerProps) {
  const { timeLeft, setTimeLeft } = useUjianStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Countdown every second
    intervalRef.current = setInterval(() => {
      setTimeLeft(Math.max(0, useUjianStore.getState().timeLeft - 1));

      if (useUjianStore.getState().timeLeft <= 0) {
        clearInterval(intervalRef.current!);
        onTimeUp();
      }
    }, 1000);

    // Sync with server every 30 seconds
    syncRef.current = setInterval(async () => {
      try {
        await apiClient.patch(`/ujian/sesi/${sesiId}/sync-timer`, {
          waktu_tersisa: Math.floor(useUjianStore.getState().timeLeft),
        });
      } catch {
        // silent
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncRef.current) clearInterval(syncRef.current);
    };
  }, [sesiId, onTimeUp]);

  const isDanger = timeLeft <= 300; // 5 menit
  const isWarning = timeLeft <= 600; // 10 menit

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-500',
        isDanger
          ? 'bg-red-100 text-red-600 animate-pulse border border-red-200'
          : isWarning
          ? 'bg-amber-100 text-amber-700 border border-amber-200'
          : 'bg-blue-100 text-blue-700 border border-blue-200'
      )}
    >
      {isDanger ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="tabular-nums">{formatDuration(timeLeft)}</span>
    </div>
  );
}
