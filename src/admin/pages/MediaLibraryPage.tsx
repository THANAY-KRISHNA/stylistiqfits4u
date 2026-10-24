import React, { useState, useEffect, useCallback } from 'react';
import {
  ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  listStorageFiles,
  deleteStorageFile,
  uploadProductImage,
  STORAGE_BUCKET,
} from '../../lib/adminData';
import { ImageOptimizer } from '../components/ImageOptimizer';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { formatBytes } from '../../lib/imageOptimizer';

interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

export const MediaLibraryPage: React.FC = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getPublicUrl = (fileName: string) => {
    if (!supabase) return '';
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`products/${fileName}`);
    return data.publicUrl;
  };

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { files: fileList, error: err } = await listStorageFiles('products');
    if (err) {
      setError(err);
    } else {
      // Filter out system placeholders if any
      setFiles((fileList as StorageFile[]).filter((f) => f.name !== '.emptyFolderPlaceholder'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('Image URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This might break products using this image.`)) {
      return;
    }
    setActionLoading(fileName);
    const { error: delErr } = await deleteStorageFile(`products/${fileName}`);
    if (delErr) {
      showToast(`Delete failed: ${delErr}`);
    } else {
      showToast('Image deleted from storage');
      await loadMedia();
    }
    setActionLoading(null);
  };

  const handleUploadBlob = async (blob: Blob, filename: string): Promise<string | null> => {
    const { url, error: uploadErr } = await uploadProductImage(blob, filename, 'products');
    if (uploadErr) {
      showToast(`Upload failed: ${uploadErr}`);
      return null;
    }
    return url;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {!isSupabaseConfigured && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-2.5 mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Local Development Mode — Image optimization runs fully in-browser. Storage uploads require Supabase configuration.</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F5] font-serif">Media Library</h1>
          <p className="text-[#7E726D] text-sm mt-0.5">
            Optimize, compress to WebP, and host product assets in Supabase Storage
          </p>
        </div>
        <button
          onClick={loadMedia}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs text-[#7E726D] hover:text-[#D4C5B9] border border-[#3D2E2A] rounded-xl hover:bg-[#3D2E2A]/50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Library
        </button>
      </div>

      {/* Upload & Optimizer Section */}
      <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 mb-8 shadow-xl">
        <h2 className="text-sm font-semibold text-[#FAF8F5] mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#C68B7B]" />
          Upload & Optimize Images
        </h2>
        <p className="text-xs text-[#7E726D] mb-5">
          Images dropped here are automatically stripped of EXIF data, resized, and converted to modern WebP format before storage upload.
        </p>

        <ImageOptimizer
          onImagesUploaded={() => {
            showToast('Images uploaded to storage successfully!');
            loadMedia();
          }}
          onUpload={handleUploadBlob}
          maxImages={12}
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-sm">
            {error.includes('bucket not found') || error.includes('does not exist')
              ? `Bucket "${STORAGE_BUCKET}" does not exist in Supabase. Please create the public bucket "${STORAGE_BUCKET}" in your Supabase dashboard.`
              : error}
          </span>
        </div>
      )}

      {/* Files Grid */}
      <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#FAF8F5] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#C68B7B]" />
            Uploaded Assets ({files.length})
          </h2>
          <span className="text-xs text-[#7E726D] font-mono">Bucket: {STORAGE_BUCKET}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#A45543] animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-10 h-10 text-[#3D2E2A] mx-auto mb-3" />
            <div className="text-[#7E726D] text-sm">No uploaded images yet</div>
            <div className="text-[#5E4E49] text-xs mt-1">
              Upload images using the optimizer above to populate your media storage
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => {
              const url = getPublicUrl(file.name);
              const isDeleting = actionLoading === file.name;
              const isCopied = copiedUrl === url;

              return (
                <div
                  key={file.name}
                  className="bg-[#1C1412] border border-[#3D2E2A] rounded-xl overflow-hidden group flex flex-col"
                >
                  <div className="aspect-square bg-black/40 relative overflow-hidden">
                    <img
                      src={url}
                      alt={file.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(url)}
                        title="Copy public URL"
                        className="w-8 h-8 rounded-lg bg-[#2E221F] text-[#FAF8F5] flex items-center justify-center hover:bg-[#A45543] transition-colors"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in new tab"
                        className="w-8 h-8 rounded-lg bg-[#2E221F] text-[#FAF8F5] flex items-center justify-center hover:bg-[#A45543] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(file.name)}
                        disabled={isDeleting}
                        title="Delete image"
                        className="w-8 h-8 rounded-lg bg-[#2E221F] text-red-400 flex items-center justify-center hover:bg-red-700 hover:text-white transition-colors"
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] font-medium text-[#FAF8F5] truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#5E4E49] mt-1 font-mono">
                      <span>{file.metadata?.size ? formatBytes(file.metadata.size) : 'WebP'}</span>
                      {file.created_at && (
                        <span>
                          {new Date(file.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E221F] border border-[#3D2E2A] rounded-xl px-4 py-3 text-xs text-[#FAF8F5] flex items-center gap-2 shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-[#C68B7B] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
