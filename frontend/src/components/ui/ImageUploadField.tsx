import { useState, useRef } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
  label: string;
  existingUrl?: string | null;
  file?: File | null;
  onChange: (file: File | null) => void;
  onRemoveExisting: () => void;
  className?: string;
}

export default function ImageUploadField({ label, existingUrl, file, onChange, onRemoveExisting, className }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    onChange(selected);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemoveExisting();
  };

  const storageUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + '/storage/';
  const displayUrl = preview || (existingUrl ? (existingUrl.startsWith('http') ? existingUrl : `${storageUrl}${existingUrl}`) : null);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-slate-400" /> {label}
        </label>
        {displayUrl && (
          <button type="button" onClick={handleRemove} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
            <Trash2 className="w-3 h-3" /> Hapus Gambar
          </button>
        )}
      </div>

      {!displayUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 px-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm hover:border-blue-300 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
        >
          <ImagePlus className="w-4 h-4" />
          Pilih Gambar
        </button>
      ) : (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
          <Image src={displayUrl} alt={label} width={400} height={300} className="max-h-48 w-auto object-contain" unoptimized />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
             <button type="button" onClick={() => inputRef.current?.click()} className="btn-md bg-white text-slate-800 hover:bg-slate-100">
               Ganti Gambar
             </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
