import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Permite subir archivos de hasta 10MB (mas margen para el formulario).
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
