import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the React app (5173) forwards API and upload requests to Express (4000).
const proxy = {
  '/api': 'http://localhost:4000',
  '/uploads': 'http://localhost:4000',
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy }, // `npm run preview` needs the API too
})
