import type { Metadata } from "next";
import { Outfit, Amiri } from "next/font/google";
import "./globals.css";
import { ClientBottomNav } from "@/components/layout/ClientBottomNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Tafsir Digital",
  description: "Aplikasi panduan spiritual dan tafsir Al-Qur'an eksklusif dari PT Sinergi Adhi Inovasi Digital.",
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${outfit.variable} ${amiri.variable} antialiased max-w-7xl mx-auto relative shadow-2xl min-h-screen bg-muted/20`}
      >
        <div className="bg-background min-h-screen pb-20 w-full relative">
          {children}
          <ClientBottomNav />
        </div>
      </body>
    </html>
  );
}
