'use client';

import { useState, useEffect } from 'react';
import { Layout, Save, Plus, Trash2 } from 'lucide-react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

export default function AdminLandingSettings() {
  const [settings, setSettings] = useState({
    hero_slides: ['Persiapkan Ujian', 'Asah Kemampuan', 'Raih Mimpimu', 'Tingkatkan Karir'],
    hero_subtitle: 'Platform Tryout Online Terpercaya #1',
    hero_description: 'Latihan soal online dengan ribuan bank soal, timer real-time, dan analisis hasil yang mendalam. Raih nilai terbaik bersama Asah Kemampuan.',
    stats_1_value: '10K+', stats_1_label: 'Peserta',
    stats_2_value: '500+', stats_2_label: 'Soal Latihan',
    stats_3_value: '95%', stats_3_label: 'Tingkat Kelulusan',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/landing-settings');
      if (res.data.data && Object.keys(res.data.data).length > 0) {
        setSettings(res.data.data);
      }
    } catch {
      toast.error('Gagal memuat pengaturan landing page');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put('/admin/landing-settings', { settings });
      toast.success('Pengaturan landing page berhasil disimpan');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string | string[]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSlideText = (index: number, text: string) => {
    const newSlides = [...settings.hero_slides];
    newSlides[index] = text;
    handleChange('hero_slides', newSlides);
  };

  const removeSlide = (index: number) => {
    const newSlides = [...settings.hero_slides];
    newSlides.splice(index, 1);
    handleChange('hero_slides', newSlides);
  };

  const addSlide = () => {
    handleChange('hero_slides', [...settings.hero_slides, 'Teks Baru']);
  };

  if (isLoading) return <div className="p-8 text-center"><span className="spinner w-8 h-8 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" /> Pengaturan Landing Page
          </h1>
          <p className="text-slate-500 mt-1">Sesuaikan teks dan konten yang muncul di halaman utama publik.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn-md bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 border-0"
        >
          {isSaving ? <span className="spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Copy */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Bagian Hero</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sub-judul (Label Kecil)</label>
              <input 
                type="text" 
                value={settings.hero_subtitle || ''} 
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Teks Animasi Slider (Teks Hijau Besar)</label>
              <div className="space-y-2 mb-2">
                {(settings.hero_slides || []).map((slide, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={slide} 
                      onChange={(e) => updateSlideText(i, e.target.value)}
                      className="input w-full"
                    />
                    <button 
                      onClick={() => removeSlide(i)}
                      className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={addSlide}
                className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> Tambah Teks Slide
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Paragraf</label>
              <textarea 
                value={settings.hero_description || ''} 
                onChange={(e) => handleChange('hero_description', e.target.value)}
                className="input w-full h-24 py-3"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Data Statistik (Hero)</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Statistik 1 - Nilai</label>
                <input 
                  type="text" 
                  value={settings.stats_1_value || ''} 
                  onChange={(e) => handleChange('stats_1_value', e.target.value)}
                  className="input w-full" placeholder="Contoh: 10K+"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Statistik 1 - Label</label>
                <input 
                  type="text" 
                  value={settings.stats_1_label || ''} 
                  onChange={(e) => handleChange('stats_1_label', e.target.value)}
                  className="input w-full" placeholder="Contoh: Peserta"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Statistik 2 - Nilai</label>
                <input 
                  type="text" 
                  value={settings.stats_2_value || ''} 
                  onChange={(e) => handleChange('stats_2_value', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Statistik 2 - Label</label>
                <input 
                  type="text" 
                  value={settings.stats_2_label || ''} 
                  onChange={(e) => handleChange('stats_2_label', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Statistik 3 - Nilai</label>
                <input 
                  type="text" 
                  value={settings.stats_3_value || ''} 
                  onChange={(e) => handleChange('stats_3_value', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Statistik 3 - Label</label>
                <input 
                  type="text" 
                  value={settings.stats_3_label || ''} 
                  onChange={(e) => handleChange('stats_3_label', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
