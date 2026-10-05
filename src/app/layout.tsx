import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modulos de Clase - Colegio Don Bosco",
  description: "Material de clase organizado por modulos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
