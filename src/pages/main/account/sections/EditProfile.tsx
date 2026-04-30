import Cropper from 'react-easy-crop';
import { useState, useRef } from 'react';

import api from '../../../../lib/axios';
import initialName from '../../../../helpers/initial-name';

import { cropImageFromUI } from '../../../../lib/media';

import SectionLayout from '../../../../components/layouts/SectionLayout';
import BottomSheet from '../../../../components/ui/BottomSheet';

import blankAvatar from '../../../../assets/images/blank.webp';
import SubmitButton from '../../../../components/elements/SubmitButton';
import ArrowLeftIcon from '../../../../components/icons/ArrowLeftIcon';

import { useAuthStore } from '../../../../stores/useAuthStore';

import type { ChangeEvent, JSX, SubmitEvent } from 'react';

type Props = { onBack: () => void };

type Field = 'fullname' | 'about';

type PixelCrop = { x: number; y: number; width: number; height: number };

export default function EditProfile({ onBack }: Props): JSX.Element {
  const { user, updateUser } = useAuthStore();

  const [form, setForm] = useState<Record<Field, string>>({
    fullname: user?.fullname || '',
    about: user?.about || '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.fullname.trim() || !form.about.trim()) return;

    setIsLoading(true);

    try {
      await api.patch('/users/profile', form);

      updateUser({ ...form });
    } catch {
      /** empty */
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: Field) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

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

      const {
        data: { avatar_url },
      } = await api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser({ avatar_url });

      setIsCropping(false);
      setImageSrc(null);
      setSelectedFile(null);
    } catch {
      /** empty */
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SectionLayout>
      <nav className="h-14 flex items-center gap-4 px-6 border-b border-ebony-light">
        <button type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <h1 className="font-semibold text-xl text-platinum/85">Edit Profile</h1>
      </nav>

      <div className="px-4 w-full flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center gap-2 py-8 border-b border-ebony-light">
          <div
            className="relative size-25 flex justify-center items-center rounded-full bg-dark-deep border-2 border-ebony-light shadow-inner hover:cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.fullname && !user.avatar_url ? (
              <span
                className="font-bold text-4xl text-platinum/85 select-none group-hover:opacity-70 transition-opacity"
                aria-hidden="true"
              >
                {initialName(user.fullname ?? user.username)}
              </span>
            ) : (
              <img
                src={user?.avatar_url ?? blankAvatar}
                alt={`Avatar ${user?.fullname || user?.username}`}
                className="w-full h-full object-cover rounded-full group-hover:opacity-70 transition-opacity"
              />
            )}
            <button
              type="button"
              disabled={isLoading || isUploading}
              aria-label="Change profile picture"
              className="absolute right-0 bottom-1 flex justify-center items-center rounded-full p-2 
               bg-ebony-light border-2 border-dark-charcoal 
               hover:bg-platinum hover:scale-110 active:scale-95 transition-all duration-200 pointer-events-none"
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

          <span className="text-platinum/65">Tap to change photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 py-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="fullname"
              className="ml-2 font-semibold text-[1.15rem] text-platinum/85 tracking-wide"
            >
              Fullname
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              autoComplete="fullname"
              value={form.fullname}
              onChange={handleChange('fullname')}
              className="h-12 outline-none rounded-xl font-semibold tracking-wide px-3 text-platinum/75 bg-dark-deep border-[0.05rem] border-ebony-light"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="about"
              className="ml-2 font-semibold text-[1.15rem] text-platinum/75 tracking-wide"
            >
              About
            </label>
            <input
              id="about"
              name="about"
              maxLength={100}
              value={form.about}
              onChange={handleChange('about')}
              className="h-12 outline-none rounded-xl font-semibold tracking-wide px-3 text-platinum/75 bg-dark-deep border-[0.05rem] border-ebony-light"
            />
            <SubmitButton label="Save Changes" mt={6} is_loading={isLoading} />
          </div>
        </form>
      </div>
      <BottomSheet
        isOpen={isCropping}
        onClose={() => {
          setIsCropping(false);
          setImageSrc(null);
        }}
        title="Adjust Profile Picture"
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
              aria-labelledby="Zoom"
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
            {isUploading ? (
              <svg
                className="animate-spin h-7 w-7"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Set as Profile Picture'
            )}
          </button>
        </div>
      </BottomSheet>
    </SectionLayout>
  );
}
