import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000, // Força o Vite a usar a porta 3000
    strictPort: true, // Se a porta 3000 estiver ocupada, ele não pula para a 3001
  },
});