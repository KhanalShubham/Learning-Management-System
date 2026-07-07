import { useRef, useState } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface ImageUploadProps {
  value?: string | null;
  label: string;
  shape?: 'square' | 'circle';
  onUpload: (file: File) => Promise<unknown>;
}

export const ImageUpload = ({ value, label, shape = 'square', onUpload }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const displaySrc = preview || value || undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider self-start">
        {label}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex items-center justify-center w-24 h-24 border-2 border-dashed border-border bg-secondary/40 overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group',
          shape === 'circle' ? 'rounded-full' : 'rounded-xl'
        )}
      >
        {displaySrc ? (
          <img src={displaySrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <Upload className="h-5 w-5 text-foreground" />
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
