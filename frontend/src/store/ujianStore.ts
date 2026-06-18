import { create } from 'zustand';
import apiClient from '@/lib/axios';
import { SesiUjian, JawabanUjian, HasilTryout } from '@/types';

interface UjianState {
  sesi: SesiUjian | null;
  soalList: any[];
  currentIndex: number;
  jawaban: Record<number, string>;
  timeLeft: number;
  isLoading: boolean;
  isSubmitting: boolean;
  hasil: HasilTryout | null;

  startUjian: (paketId: number) => Promise<SesiUjian>;
  loadSesi: (sesiId: number) => Promise<void>;
  setJawaban: (soalId: number, jawaban: string) => void;
  saveJawaban: (sesiId: number, soalId: number, jawaban: string) => Promise<void>;
  nextSoal: () => void;
  prevSoal: () => void;
  goToSoal: (index: number) => void;
  setTimeLeft: (time: number) => void;
  submitUjian: (sesiId: number) => Promise<HasilTryout>;
  resetUjian: () => void;
}

export const useUjianStore = create<UjianState>((set, get) => ({
  sesi: null,
  soalList: [],
  currentIndex: 0,
  jawaban: {},
  timeLeft: 0,
  isLoading: false,
  isSubmitting: false,
  hasil: null,

  startUjian: async (paketId: number) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/ujian/mulai', { paket_id: paketId });
      const { sesi, soal } = response.data.data;

      // Build jawaban map from existing answers
      const jawabanMap: Record<number, string> = {};
      if (sesi.jawaban) {
        sesi.jawaban.forEach((j: JawabanUjian) => {
          if (j.jawaban) jawabanMap[j.soal_id] = j.jawaban;
        });
      }

      set({
        sesi,
        soalList: soal,
        jawaban: jawabanMap,
        timeLeft: sesi.waktu_tersisa,
        currentIndex: 0,
        isLoading: false,
        hasil: null,
      });

      return sesi;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadSesi: async (sesiId: number) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/ujian/sesi/${sesiId}`);
      const { sesi, soal } = response.data.data;

      const jawabanMap: Record<number, string> = {};
      if (sesi.jawaban) {
        sesi.jawaban.forEach((j: JawabanUjian) => {
          if (j.jawaban) jawabanMap[j.soal_id] = j.jawaban;
        });
      }

      set({
        sesi,
        soalList: soal,
        jawaban: jawabanMap,
        timeLeft: sesi.waktu_tersisa,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setJawaban: (soalId: number, jawaban: string) => {
    set((state) => ({
      jawaban: { ...state.jawaban, [soalId]: jawaban },
    }));
  },

  saveJawaban: async (sesiId: number, soalId: number, jawaban: string) => {
    get().setJawaban(soalId, jawaban);
    try {
      await apiClient.post(`/ujian/sesi/${sesiId}/jawaban`, {
        soal_id: soalId,
        jawaban,
      });
    } catch {
      // silent fail, local state already updated
    }
  },

  nextSoal: () => {
    const { currentIndex, soalList } = get();
    if (currentIndex < soalList.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevSoal: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goToSoal: (index: number) => {
    set({ currentIndex: index });
  },

  setTimeLeft: (time: number) => {
    set({ timeLeft: time });
  },

  submitUjian: async (sesiId: number) => {
    set({ isSubmitting: true });
    try {
      const response = await apiClient.post(`/ujian/sesi/${sesiId}/submit`);
      const hasil = response.data.data;
      set({ hasil, isSubmitting: false });
      return hasil;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  resetUjian: () => {
    set({
      sesi: null,
      soalList: [],
      currentIndex: 0,
      jawaban: {},
      timeLeft: 0,
      isLoading: false,
      isSubmitting: false,
      hasil: null,
    });
  },
}));
