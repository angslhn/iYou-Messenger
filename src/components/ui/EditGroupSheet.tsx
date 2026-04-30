import Cropper from 'react-easy-crop';
import { useState, useEffect, useRef } from 'react';

import api from '../../lib/axios';
import { cropImageFromUI } from '../../lib/media';

import BottomSheet from './BottomSheet';
import SubmitButton from '../elements/SubmitButton';

import type { ChangeEvent, JSX, FormEvent } from 'react';

type PixelCrop = { x: number; y: number; width: number; height: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  groupData: { id: string; name: string; description: string | null; avatar_url: string | null };
  onSuccess: () => void;
};

export default function EditGroupSheet({
  isOpen,
  onClose,
  groupData,
  onSuccess,
}: Props): JSX.Element {
  const [name, setName] = useState(groupData.name);
  const [description, setDescription] = useState(groupData.description ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(groupData.avatar_url);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(groupData.name);
    setDescription(groupData.description ?? '');
    setAvatarUrl(groupData.avatar_url);
  }, [groupData]);

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

  const handleUploadAvatar = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedFile = await cropImageFromUI(selectedFile, croppedAreaPixels);
      const formData = new FormData();
      formData.append('image', croppedFile);

      const { data } = await api.patch(`/conversations/${groupData.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAvatarUrl(data.avatarUrl);

      setIsCropping(false);
      setImageSrc(null);
      setSelectedFile(null);

      onSuccess();
    } catch {
      /** empty */
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await api.patch(`/conversations/${groupData.id}`, { name, description });
      onSuccess();
      onClose();
    } catch {
      /** empty */
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Group Info">
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full flex flex-col items-center justify-center gap-2 py-4">
            <div
              className="relative size-22 flex justify-center items-center rounded-full bg-dark-deep border-2 border-ebony-light shadow-inner hover:cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Group Avatar ${name}`}
                  className="w-full h-full object-cover rounded-full group-hover:opacity-70 transition-opacity"
                />
              ) : (
                <span className="font-bold text-4xl text-platinum/85 select-none group-hover:opacity-70 transition-opacity">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
              <button
                type="button"
                disabled={isLoading || isUploading}
                className="absolute right-0 bottom-0 flex justify-center items-center rounded-full p-2 bg-ebony-light border-2 border-dark-charcoal hover:bg-platinum transition-all duration-200 pointer-events-none group-hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="size-4 fill-platinum/85 group-hover:fill-dark-charcoal"
                >
                  <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                </svg>
              </button>
            </div>
            <span className="text-platinum/50 text-xs font-semibold tracking-wide">
              {isUploading ? 'Uploading...' : 'Tap To Change Avatar'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="groupName" className="text-sm font-semibold text-platinum/50 ml-1">
                Group Name
              </label>
              <input
                id="groupName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="h-12 px-4 rounded-xl bg-dark-deep border border-ebony-light text-platinum/85 outline-none focus:border-platinum/40 transition-colors font-semibold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="groupDesc" className="text-sm font-semibold text-platinum/50 ml-1">
                Description
              </label>
              <textarea
                id="groupDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className="h-24 px-4 py-2 rounded-xl bg-dark-deep border border-ebony-light text-platinum/85 outline-none focus:border-platinum/40 transition-colors resize-none font-medium leading-relaxed"
              />
            </div>
            <SubmitButton label="Save Changes" mt={2} is_loading={isLoading} />
          </form>
        </div>
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
            <div className="relative w-full h-[60vh] max-h-90 rounded-2xl overflow-hidden bg-dark-charcoal border border-ebony-light mb-6">
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
            onClick={handleUploadAvatar}
            disabled={isUploading}
            className="h-12 w-full flex justify-center items-center rounded-xl font-bold text-[1.1rem] bg-platinum/85 text-night disabled:opacity-40 hover:cursor-pointer active:scale-95 transition-all"
          >
            {isUploading ? 'Uploading...' : 'Set Group Picture'}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
