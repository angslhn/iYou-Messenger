export const env = {
  mode: import.meta.env.MODE,
  baseURL: import.meta.env.BASE_URL,
  is_production: import.meta.env.PROD,
  is_development: import.meta.env.DEV,
  app_title: import.meta.env.VITE_APP_TITLE,
  apiURL: import.meta.env.VITE_API_URL,
  wsURL: import.meta.env.VITE_WS_URL,
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  cloudinaryPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
} as const;
