// src/lib/media.ts

/**
 * Cek durasi video, return durasi dalam detik.
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => reject(new Error('Failed to read video metadata'));
    video.src = url;
  });
}

/**
 * Validasi ketat sebelum file diizinkan untuk di-upload.
 * Aturan:
 * 1. Ukuran Maksimal: 100MB (Aman untuk di-upload langsung ke Cloudinary)
 * 2. Resolusi Maksimal: 1920x1920 (FHD)
 * 3. Durasi Video: Maksimal 30 detik
 * 4. Aspect Ratio: 1:1, 4:3, 3:4, 16:9, 9:16
 */
export const validateMediaPreFlight = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 0. Validasi File Type
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return reject('Unsupported file type. Allowed formats: jpg, png, webp, mp4, webm, mov.');
    }

    // 1. Validasi Ukuran (Maks 100MB)
    const MAX_SIZE = 100 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return reject('File too large! Maximum allowed size is 100MB.');
    }

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);

        // 2. Validasi Durasi (Maks 30s)
        if (video.duration > 30) {
          return reject('Video duration cannot exceed 30 seconds.');
        }

        const w = video.videoWidth;
        const h = video.videoHeight;

        // 3. Validasi Resolusi (Maks FHD)
        if (w > 1920 || h > 1920) {
          return reject('Video resolution too high. Maximum allowed is 1080p (FHD).');
        }

        // 4. Validasi Aspect Ratio
        const ratio = Math.max(w, h) / Math.min(w, h);
        const allowedRatios = [1, 4 / 3, 16 / 9];
        // Toleransi error desimal 0.1
        const isValidRatio = allowedRatios.some((r) => Math.abs(ratio - r) < 0.1);

        if (!isValidRatio) {
          return reject('Unsupported aspect ratio. Please use 1:1, 4:3, or 16:9 formats.');
        }

        resolve();
      };

      video.onerror = () => reject('Failed to read video format. The file might be corrupted.');
      video.src = url;
    } else {
      // Validasi Gambar
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.width;
        const h = img.height;

        if (w > 1920 || h > 1920) {
          return reject('Image resolution too high. Maximum allowed is 1080p (FHD).');
        }

        const ratio = Math.max(w, h) / Math.min(w, h);
        const allowedRatios = [1, 4 / 3, 16 / 9];
        const isValidRatio = allowedRatios.some((r) => Math.abs(ratio - r) < 0.1);

        if (!isValidRatio) {
          return reject('Unsupported aspect ratio. Please use 1:1, 4:3, or 16:9 formats.');
        }

        resolve();
      };

      img.onerror = () => reject('Failed to read image format. The file might be corrupted.');
      img.src = url;
    }
  });
};

/**
 * Memotong gambar berdasarkan area spesifik dari UI Cropper dan me-resize ke ukuran target.
 */
export async function cropImageFromUI(
  file: File,
  pixelCrop: { x: number; y: number; width: number; height: number },
  targetSize = 1024,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return reject(new Error('Canvas context not available'));

      // Output selalu persegi 1024x1024 (atau sesuai targetSize)
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Ambil gambar asli berdasarkan koordinat pixelCrop, lalu render penuhi ukuran canvas
      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetSize,
        targetSize,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Image processing failed'));

          const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

          resolve(new File([blob], newFileName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.9, // Quality sedikit diturunkan agar lebih ringan
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
