import type { Metadata } from "next";
import { Amiri, Cinzel, Cairo } from "next/font/google";
import "./globals.css";
import { ClientBottomNav } from "@/components/layout/ClientBottomNav";
import { ThemeProvider } from "next-themes";

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
  style: ["normal", "italic"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quranic Life Hacking",
  description: "Panduan spiritual premium — Tafsir Al-Qur'an, Sains Islam, dan Hijrah Digital.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Quranic Life Hacking",
    description: "Panduan spiritual premium — Tafsir Al-Qur'an, Sains Islam, dan Hijrah Digital.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#060d12",
};

import { ScrollSaver } from "@/components/layout/ScrollSaver";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning className="dark">
      <body
        suppressHydrationWarning={true}
        className={`${amiri.variable} ${cinzel.variable} ${cairo.variable} font-cairo antialiased bg-[#060d12] text-[#E8F4EC] max-w-7xl mx-auto relative shadow-2xl min-h-screen transition-colors duration-200`}
      >
        <div className="min-h-screen pb-24 w-full relative">
          <ScrollSaver />
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
            <ClientBottomNav />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
