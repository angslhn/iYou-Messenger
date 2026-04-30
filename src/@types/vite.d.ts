interface EnvConfig {
  readonly MODE: 'production' | 'development' | 'staging' | 'test';
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
}

interface ImportMeta {
  readonly env: EnvConfig;
}
