/**
 * Client-side image optimization utilities using the Canvas API.
 * Converts JPEG/PNG/etc. to WebP, resizes to fit within maxWidth/maxHeight,
 * strips EXIF metadata, and returns the optimized Blob and preview URL.
 *
 * No server required — all processing runs in the browser.
 */

export interface OptimizeOptions {
  /** Target format (default: webp) */
  format?: 'webp' | 'jpeg';
  /** WebP quality 0-1 (default: 0.80) */
  quality?: number;
  /** Maximum width in pixels. Larger images are scaled down proportionally. */
  maxWidth?: number;
  /** Maximum height in pixels. Larger images are scaled down proportionally. */
  maxHeight?: number;
  /** Generate a thumbnail as well */
  thumbnail?: boolean;
  /** Thumbnail max dimension (default: 400) */
  thumbnailSize?: number;
}

export interface OptimizeResult {
  blob: Blob;
  url: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  format: string;
  thumbnail?: { blob: Blob; url: string; width: number; height: number };
}

/**
 * Loads a File into an HTMLImageElement and returns it.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

/**
 * Draw an image to a canvas at the given dimensions, then export as Blob.
 */
function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D context not available'));

    // White background for transparency (JPEG doesn't support alpha)
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob returned null'));
        resolve(blob);
      },
      format,
      quality
    );
  });
}

/**
 * Calculate scaled dimensions, never upscaling.
 */
export function scaleDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (srcWidth <= maxWidth && srcHeight <= maxHeight) {
    return { width: srcWidth, height: srcHeight };
  }

  const ratioW = maxWidth / srcWidth;
  const ratioH = maxHeight / srcHeight;
  const ratio = Math.min(ratioW, ratioH);

  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}

/**
 * Main optimization function.
 * Converts an uploaded image file to WebP (or JPEG), resizes it,
 * strips metadata, and optionally generates a thumbnail.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const {
    format = 'webp',
    quality = 0.80,
    maxWidth = 1200,
    maxHeight = 1600,
    thumbnail = true,
    thumbnailSize = 400,
  } = options;

  const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';

  const img = await loadImage(file);
  const { width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight);

  const blob = await canvasToBlob(img, width, height, mimeType, quality);
  const url = URL.createObjectURL(blob);

  const result: OptimizeResult = {
    blob,
    url,
    originalSize: file.size,
    optimizedSize: blob.size,
    savingsPercent: Math.round((1 - blob.size / file.size) * 100),
    width,
    height,
    format,
  };

  if (thumbnail) {
    const thumbDims = scaleDimensions(img.naturalWidth, img.naturalHeight, thumbnailSize, thumbnailSize);
    const thumbBlob = await canvasToBlob(img, thumbDims.width, thumbDims.height, mimeType, 0.75);
    result.thumbnail = {
      blob: thumbBlob,
      url: URL.createObjectURL(thumbBlob),
      width: thumbDims.width,
      height: thumbDims.height,
    };
  }

  return result;
}

/**
 * Release object URLs created by optimizeImage to prevent memory leaks.
 * Call this after the upload is complete or the component unmounts.
 */
export function revokeOptimizeResult(result: OptimizeResult): void {
  try {
    URL.revokeObjectURL(result.url);
    if (result.thumbnail) URL.revokeObjectURL(result.thumbnail.url);
  } catch {
    // ignore
  }
}

/**
 * Format a byte count as a human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Check whether the browser supports WebP encoding via Canvas.
 */
export async function supportsWebP(): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob !== null && blob.size > 0),
      'image/webp',
      0.5
    );
  });
}
