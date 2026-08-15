import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    // The Express wrapper owns the dev server lifecycle. Disable Vite's
    // standalone HMR websocket to avoid a second process binding the preview
    // websocket port during server restarts.
    hmr: false,
  },
});
