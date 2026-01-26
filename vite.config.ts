import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // Quando o React chamar "/api/users/me"...
      '/api': {
        target: 'http://localhost:8080', // ...o Vite manda para o Java
        changeOrigin: true,
        secure: false,
        // ...e remove o "/api" para o Java receber apenas "/users/me"
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});