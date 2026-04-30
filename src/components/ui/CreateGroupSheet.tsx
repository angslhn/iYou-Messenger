import Cropper from 'react-easy-crop';
import { useState, useRef } from 'react';
import api from '../../lib/axios';

import { cropImageFromUI } from '../../lib/media';

import BottomSheet from './BottomSheet';
import SubmitButton from '../elements/SubmitButton';

import type { ChangeEvent, SubmitEvent, JSX } from 'react';

type PixelCrop = { x: number; y: number; width: number; height: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateGroupSheet({ isOpen, onClose, onSuccess }: Props): JSX.Element {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleSaveCrop = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    try {
      const file = await cropImageFromUI(selectedFile, croppedAreaPixels);

      const objectUrl = URL.createObjectURL(file);

      setCroppedFile(file as File);
      setPreviewUrl(objectUrl);

      setIsCropping(false);
      setImageSrc(null);
    } catch (error) {
      console.error('Failed to crop image', error);
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('name', name.trim());

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      if (croppedFile) {
        formData.append('image', croppedFile);
      }

      await api.post('/conversations/group', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      handleClose();
      if (onSuccess) onSuccess();
    } catch {
      /** empty */
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCroppedFile(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(null);

    setLoading(false);
    onClose();
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={handleClose} title="Create New Group">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="relative size-22 flex justify-center items-center rounded-full bg-dark-deep border-2 border-dashed border-ebony-light hover:border-platinum/40 transition-colors hover:cursor-pointer group overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Group Preview"
                  className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="size-7 fill-platinum/40 group-hover:scale-110 transition-transform"
                >
                  <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
                </svg>
              )}
            </div>
            <span className="text-platinum/50 text-xs font-semibold tracking-wide">
              {previewUrl ? 'Tap To Change' : 'Add Group Avatar'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="group-name" className="ml-1 font-semibold text-sm text-platinum/85">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="group-name"
              placeholder="e.g. My Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="h-12 outline-none rounded-xl px-4 bg-dark-deep border border-ebony-light text-platinum/85 placeholder:text-platinum/35 text-sm focus:border-platinum/40 transition-all"
            />
            <span className="text-right text-xs text-platinum/30 mr-1">{name.length}/50</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="group-desc" className="ml-1 font-semibold text-sm text-platinum/85">
              Description <span className="text-platinum/40 font-normal">(optional)</span>
            </label>
            <textarea
              id="group-desc"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="outline-none rounded-xl px-4 py-3 bg-dark-deep border border-ebony-light text-platinum/85 placeholder:text-platinum/35 text-sm resize-none focus:border-platinum/40 transition-all [scrollbar-width:none]"
            />
            <span className="text-right text-xs text-platinum/30 mr-1">
              {description.length}/200
            </span>
          </div>
          <SubmitButton label="Create Group" mt={0} is_loading={loading} />
        </form>
      </BottomSheet>
      <BottomSheet
        isOpen={isCropping}
        onClose={() => {
          setIsCropping(false);
          setImageSrc(null);
        }}
        title="Adjust Group Picture"
      >
        <div className="flex flex-col w-full">
          {imageSrc && (
            <div className="relative w-full h-[60vh] max-h-96 rounded-2xl overflow-hidden bg-dark-charcoal border border-ebony-light mb-6">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                onZoomChange={setZoom}
              />
            </div>
          )}
          <div className="flex items-center gap-4 mb-8 px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-6 fill-platinum/50"
            >
              <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM200 248C186.7 248 176 258.7 176 272C176 285.3 186.7 296 200 296L344 296C357.3 296 368 285.3 368 272C368 258.7 357.3 248 344 248L200 248z" />
            </svg>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-ebony-light rounded-lg appearance-none cursor-pointer accent-platinum"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="size-6 fill-platinum/85"
            >
              <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 176C258.7 176 248 186.7 248 200L248 248L200 248C186.7 248 176 258.7 176 272C176 285.3 186.7 296 200 296L248 296L248 344C248 357.3 258.7 368 272 368C285.3 368 296 357.3 296 344L296 296L344 296C357.3 296 368 285.3 368 272C368 258.7 357.3 248 344 248L296 248L296 200C296 186.7 285.3 176 272 176z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={handleSaveCrop}
            className="h-12 w-full flex justify-center items-center rounded-xl font-bold text-[1.1rem] bg-platinum/85 text-night hover:cursor-pointer active:scale-95 transition-all"
          >
            Apply Picture
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
