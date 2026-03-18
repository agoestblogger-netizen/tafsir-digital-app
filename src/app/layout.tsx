import type { Metadata } from "next";
import { Outfit, Amiri } from "next/font/google";
import "./globals.css";
import { ClientBottomNav } from "@/components/layout/ClientBottomNav";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${amiri.variable} antialiased max-w-7xl mx-auto relative shadow-2xl min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}
      >
        <ThemeProvider>
          <div className="min-h-screen pb-20 w-full relative">
            {children}
            <ClientBottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
