import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  optimizeImage,
  revokeOptimizeResult,
  formatBytes,
  supportsWebP,
  type OptimizeResult,
  type OptimizeOptions,
} from '../../lib/imageOptimizer';

interface UploadedImage {
  file: File;
  result: OptimizeResult;
  uploading: boolean;
  uploaded: boolean;
  uploadedUrl?: string;
  error?: string;
}

interface ImageOptimizerProps {
  /** Called with the final public URL(s) after upload */
  onImagesUploaded: (urls: string[]) => void;
  /** Upload function — should return public URL or null */
  onUpload: (blob: Blob, filename: string) => Promise<string | null>;
  /** Maximum number of images */
  maxImages?: number;
  /** Current images (for display) */
  existingImages?: string[];
  /** Called when an existing image is removed */
  onRemoveExisting?: (url: string) => void;
}

const DEFAULT_OPTIONS: OptimizeOptions = {
  format: 'webp',
  quality: 0.80,
  maxWidth: 1200,
  maxHeight: 1600,
  thumbnail: true,
  thumbnailSize: 400,
};

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  onImagesUploaded,
  onUpload,
  maxImages = 6,
  existingImages = [],
  onRemoveExisting,
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<OptimizeOptions>(DEFAULT_OPTIONS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const remaining = maxImages - existingImages.length - images.length;
    const toProcess = fileArray.slice(0, Math.max(0, remaining));

    if (!toProcess.length) return;

    setProcessing(true);

    const webpSupported = await supportsWebP();
    const effectiveOptions = {
      ...options,
      format: webpSupported ? options.format : 'jpeg',
    };

    const results: UploadedImage[] = [];

    for (const file of toProcess) {
      try {
        const result = await optimizeImage(file, effectiveOptions);
        results.push({ file, result, uploading: false, uploaded: false });
      } catch (e: any) {
        console.error(`Failed to optimize ${file.name}:`, e);
      }
    }

    setImages((prev) => [...prev, ...results]);
    setProcessing(false);
  }, [options, maxImages, existingImages.length, images.length]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const item = prev[idx];
      if (item) revokeOptimizeResult(item.result);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const uploadAll = async () => {
    const pending = images.filter((img) => !img.uploaded && !img.uploading);
    if (!pending.length) return;

    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.uploaded || img.uploading) continue;

      setImages((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, uploading: true } : item))
      );

      const ext = options.format === 'webp' ? 'webp' : 'jpg';
      const filename = `${Date.now()}-${i}.${ext}`;

      try {
        const url = await onUpload(img.result.blob, filename);
        if (url) {
          uploadedUrls.push(url);
          setImages((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, uploading: false, uploaded: true, uploadedUrl: url } : item
            )
          );
        } else {
          throw new Error('Upload returned no URL');
        }
      } catch (e: any) {
        setImages((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, uploading: false, error: e.message } : item
          )
        );
      }
    }

    if (uploadedUrls.length) {
      onImagesUploaded(uploadedUrls);
    }
  };

  const canAddMore = existingImages.length + images.length < maxImages;
  const hasUnuploaded = images.some((img) => !img.uploaded);

  return (
    <div className="space-y-4">
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {existingImages.map((url, i) => (
            <div key={url + i} className="relative group aspect-square rounded-xl overflow-hidden bg-[#1C1412] border border-[#3D2E2A]">
              <img src={url} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
              {onRemoveExisting && (
                <button
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">Primary</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New images queue */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-[#1C1412] border border-[#3D2E2A]">
              <img src={img.result.url} alt={`New image ${i + 1}`} className="w-full h-full object-cover" />
              
              {/* Status overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              {img.uploaded && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow" />
                </div>
              )}
              {img.error && (
                <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-300" />
                </div>
              )}

              {/* Size badge */}
              <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                {formatBytes(img.result.optimizedSize)}
                {img.result.savingsPercent > 0 && (
                  <span className="text-emerald-400 ml-1">-{img.result.savingsPercent}%</span>
                )}
              </div>

              {/* Remove button */}
              {!img.uploading && !img.uploaded && (
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragging ? 'border-[#A45543] bg-[#A45543]/10' : 'border-[#3D2E2A] hover:border-[#A45543]/50 hover:bg-[#3D2E2A]/30'
          }`}
        >
          {processing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-[#A45543] animate-spin" />
              <p className="text-[#7E726D] text-xs">Optimizing images…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#5E4E49]" />
              <p className="text-[#7E726D] text-xs">
                Drag & drop images, or <span className="text-[#A45543]">browse</span>
              </p>
              <p className="text-[#5E4E49] text-[10px]">
                JPEG, PNG, WebP · Auto-converts to WebP · Max {maxImages} images
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Quality options */}
      {images.length > 0 && (
        <div className="bg-[#1C1412] border border-[#3D2E2A] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs text-[#7E726D] hover:text-[#D4C5B9] transition-colors"
          >
            <span>Optimization settings · Quality {Math.round((options.quality ?? 0.8) * 100)}% · Max {options.maxWidth}px</span>
            {showOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showOptions && (
            <div className="px-4 pb-4 space-y-4 border-t border-[#3D2E2A] pt-3">
              <div>
                <label className="text-[11px] text-[#7E726D] mb-2 block">WebP Quality: {Math.round((options.quality ?? 0.8) * 100)}%</label>
                <input
                  type="range" min={40} max={95} step={5}
                  value={Math.round((options.quality ?? 0.8) * 100)}
                  onChange={(e) => setOptions((o) => ({ ...o, quality: Number(e.target.value) / 100 }))}
                  className="w-full accent-[#A45543]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#7E726D] mb-2 block">Max Width: {options.maxWidth}px</label>
                <select
                  value={options.maxWidth}
                  onChange={(e) => setOptions((o) => ({ ...o, maxWidth: Number(e.target.value), maxHeight: Number(e.target.value) * 1.5 }))}
                  className="w-full bg-[#2E221F] border border-[#3D2E2A] rounded-lg px-3 py-1.5 text-xs text-[#D4C5B9] focus:outline-none"
                >
                  <option value={800}>800px (Product cards)</option>
                  <option value={1200}>1200px (Detail view — recommended)</option>
                  <option value={1600}>1600px (High resolution)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      {hasUnuploaded && (
        <button
          onClick={uploadAll}
          className="w-full flex items-center justify-center gap-2 bg-[#A45543] hover:bg-[#8E3D2D] text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload {images.filter((i) => !i.uploaded).length} Image{images.filter((i) => !i.uploaded).length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};
