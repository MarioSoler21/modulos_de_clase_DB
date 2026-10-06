import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fuente = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Instituto Don Bosco - Aula Virtual",
    template: "%s | Instituto Don Bosco",
  },
  description: "Plataforma de módulos de clase del Instituto Don Bosco, San Pedro Sula, Honduras.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fuente.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
