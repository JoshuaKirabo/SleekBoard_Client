import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(
  {
    plugins: [react(), tailwindcss()],
    server:
      {
        proxy:
          {
            // Logo images for colour sampling, same-origin so a canvas can read them. In dev this goes straight to
            // Google's favicon service and needs no API running; in production the Express route at /api/logos
            // does the same job. The API itself is on VITE_API_URL, so this path only carries logos.
            "/logos":
              {
                target: "https://www.google.com",
                changeOrigin: true,
                followRedirects: true,
                rewrite: (path) => `/s2/favicons?domain=${encodeURIComponent(path.replace(/^\/logos\//, ""))}&sz=128`,
              },
          },
      },
  });
