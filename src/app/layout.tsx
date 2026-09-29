import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "SMARTPARK Enterprise • Sistema de Gestão de Estacionamento",
  description: "Terminal industrial corporativo de autoatendimento touch-screen para pagamento e validação de tickets.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased dark ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#050507] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
