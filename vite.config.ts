import babel from '@rolldown/plugin-babel'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig } from 'vite'
import { reactCompilerPreset } from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
