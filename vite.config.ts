import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import type { ServerOptions } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let https: ServerOptions['https'] = undefined;

  try {
    const keyPath = path.resolve(__dirname, 'localhost-key.pem');
    const certPath = path.resolve(__dirname, 'localhost.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  } catch (error) {
    console.warn('HTTPS certificates not found, using HTTP');
  }

  return {
    server: {
      host: "::",
      port: 8080,
      https,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
