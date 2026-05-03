import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.RESEND_API_KEY': JSON.stringify(env.RESEND_API_KEY),
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY),
      'process.env.VITE_GEMINI_CHAT_MODEL': JSON.stringify(env.VITE_GEMINI_CHAT_MODEL),
      'process.env.VITE_GEMINI_EMBED_MODEL': JSON.stringify(env.VITE_GEMINI_EMBED_MODEL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
