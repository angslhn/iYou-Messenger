import { useState, useRef } from 'react';

import api from '../../lib/axios';

import { env } from '../../config/env';
import { useAuthStore } from '../../stores/useAuthStore';
import { validateMediaPreFlight } from '../../lib/media';

import BottomSheet from './BottomSheet';

import type { JSX, ChangeEvent } from 'react';

type Tab = 'text' | 'media';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const BG_COLORS = [
  '#0e0e0e',
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#1b4332',
  '#2d6a4f',
  '#6b2737',
  '#370617',
  '#3d2b1f',
  '#2c2c54',
  '#4a0e8f',
  '#1a1a1a',
];

export default function CreateStorySheet({ isOpen, onClose }: Props): JSX.Element {
  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#1a1a2e');

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [caption, setCaption] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUserId = useAuthStore((state) => state.user?.id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setText('');
    setCaption('');
    setBgColor('#1a1a2e');
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setError('');
    setLoading(false);
    onClose();
  };

  const handleMediaSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      await validateMediaPreFlight(file);

      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);

      setMediaFile(file);
      setMediaPreview(previewUrl);
      setMediaType(isVideo ? 'video' : 'image');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || err || 'Failed to process file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (tab === 'text' && !text.trim()) return;
    if (tab === 'media' && !mediaFile) return;

    setError('');
    setLoading(true);

    try {
      let mediaData = {};

      if (tab === 'media' && mediaFile) {
        const cloudFormData = new FormData();

        cloudFormData.append('file', mediaFile);
        cloudFormData.append('upload_preset', env.cloudinaryPreset);

        const timeString = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        const customFileName = `${currentUserId}_${timeString}`;

        cloudFormData.append('public_id', customFileName);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/auto/upload`;

        const cloudRes = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudFormData,
        });

        if (!cloudRes.ok) {
          throw new Error('Failed to upload media to Cloudinary. Please try again.');
        }

        const cloudResult = await cloudRes.json();

        // Simpan hasil kembalian dari Cloudinary
        mediaData = {
          media_url: cloudResult.secure_url,
          media_public_id: cloudResult.public_id,
          media_type: cloudResult.resource_type === 'video' ? 'video' : 'image',
        };
      }

      // Siapkan Payload JSON untuk Backend Railway
      const payload =
        tab === 'text'
          ? { content_text: text, bg_color: bgColor }
          : { ...mediaData, content_text: caption.trim() || undefined };

      // Tembak ke Backend (Sekarang murni pakai JSON, bukan FormData lagi!)
      await api.post('/stories/create', payload);

      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while posting the story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Create Story">
      <div className="flex gap-2 mb-5 p-1 bg-dark-deep rounded-xl border border-ebony-light">
        <button
          type="button"
          onClick={() => setTab('text')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all hover:cursor-pointer ${
            tab === 'text'
              ? 'bg-platinum/85 text-dark-charcoal'
              : 'text-platinum/60 hover:text-platinum/85'
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => setTab('media')}
          className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all hover:cursor-pointer ${
            tab === 'media'
              ? 'bg-platinum/85 text-dark-charcoal'
              : 'text-platinum/60 hover:text-platinum/85'
          }`}
        >
          Photo / Video
        </button>
      </div>
      {tab === 'text' && (
        <div className="flex flex-col gap-4">
          <div
            className="hidden [@media(min-height:760px)]:flex relative w-full aspect-9/16 max-h-64 rounded-2xl items-center justify-center overflow-hidden transition-colors"
            style={{ backgroundColor: bgColor }}
          >
            {text ? (
              <p className="text-white font-semibold text-center px-6 text-base leading-relaxed wrap-break-word">
                {text}
              </p>
            ) : (
              <span className="text-white/30 text-sm select-none">Preview will appear here</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <textarea
              placeholder="Write something..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={700}
              rows={3}
              className="outline-none rounded-xl px-4 py-3 bg-dark-deep border border-ebony-light text-platinum/85 placeholder:text-platinum/35 text-sm resize-none focus:border-platinum/40 transition-all [scrollbar-width:none]"
            />
            <span className="text-right text-xs text-platinum/30 mr-1 select-none">
              {text.length}/700
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-platinum/50 select-none">
              Background Color
            </span>
            <div className="flex gap-2 flex-wrap">
              {BG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBgColor(color)}
                  style={{ backgroundColor: color }}
                  className={`size-8 rounded-full border-2 transition-all hover:cursor-pointer active:scale-90 ${
                    bgColor === color ? 'border-platinum/85 scale-110' : 'border-ebony-light'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handlePost}
            disabled={!text.trim() || loading}
            className="h-12 w-full flex justify-center items-center rounded-xl font-bold text-[1.1rem] bg-platinum/85 text-night disabled:opacity-40 hover:cursor-pointer active:scale-95 transition-all"
          >
            {loading ? (
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Post Story'
            )}
          </button>
        </div>
      )}

      {tab === 'media' && (
        <div className="flex flex-col gap-4">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-600/10 border border-red-600/30">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}
          {mediaPreview ? (
            <div className="flex flex-col gap-3">
              <div className="relative w-full aspect-9/16 max-h-64 rounded-2xl overflow-hidden bg-black">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className="size-full object-contain" />
                ) : (
                  <video
                    src={mediaPreview}
                    className="size-full object-contain"
                    controls
                    playsInline
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setMediaType(null);
                    setCaption('');
                    setError('');
                  }}
                  className="absolute top-2 right-2 size-8 flex justify-center items-center rounded-full bg-dark-charcoal/80 border border-ebony-light hover:cursor-pointer active:scale-90 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="size-4 fill-platinum/85"
                  >
                    <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={100}
                className="w-full h-11 outline-none rounded-xl px-4 bg-dark-deep border border-ebony-light text-platinum/85 placeholder:text-platinum/35 text-sm transition-all focus:border-platinum/40"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full aspect-9/16 max-h-64 rounded-2xl border-2 border-dashed border-ebony-light flex flex-col items-center justify-center gap-3 bg-dark-deep hover:border-platinum/40 hover:cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-8 w-8 text-platinum/50"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-platinum/50 select-none">Processing files...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="size-10 fill-platinum/30"
                  >
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-40-80a8,8,0,0,1-8,8H136v16a8,8,0,0,1-16,0V144H104a8,8,0,0,1,0-16h16V112a8,8,0,0,1,16,0v16h16A8,8,0,0,1,160,136Z" />
                  </svg>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-platinum/60 text-sm select-none">
                      Tap to upload
                    </span>
                    <span className="text-xs text-platinum/35 select-none">
                      JPG, PNG, WEBP, MP4, WEBM, MOV
                    </span>
                    <span className="text-xs text-platinum/35 select-none">
                      Max 100MB · Video max 30 seconds
                    </span>
                  </div>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            onChange={handleMediaSelect}
            className="hidden"
          />
          {mediaFile && (
            <div className="px-4 py-2 rounded-xl bg-dark-deep border border-ebony-light">
              <span className="text-xs text-platinum/50 truncate block">{mediaFile.name}</span>
              <span className="text-xs text-platinum/30">
                {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                {mediaType === 'video' && ' · Video'}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handlePost}
            disabled={!mediaFile || loading}
            className="h-12 w-full flex justify-center items-center rounded-xl font-bold text-[1.1rem] bg-platinum/85 text-night disabled:opacity-40 hover:cursor-pointer active:scale-95 transition-all"
          >
            {loading ? (
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Post Story'
            )}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
