import type { Metadata } from "next";
import { Outfit, Amiri } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

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
  title: "Quranic Life-Hacking",
  description: "Mentor saku menggabungkan Al-Qur'an, sains, psikologi, dan pelacakan kebiasaan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${outfit.variable} ${amiri.variable} antialiased max-w-md mx-auto relative shadow-2xl min-h-screen bg-muted/20`}
      >
        <div className="bg-background min-h-screen pb-20">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
