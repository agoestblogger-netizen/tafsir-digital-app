"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "beranda",  icon: "🏠", label: "Beranda",  href: "/" },
  { id: "quran",   icon: "📖", label: "Al Quran", href: "/surah" },
  { id: "hadits",  icon: "📜", label: "Hadist",   href: "/hadits" },
  { id: "sains",   icon: "🔬", label: "Sains",    href: "/tafsir-sains" },
];

// ── Desktop sidebar (collapsed icon-only, sticky left) ──────────────────────
function DesktopSideNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="hidden lg:flex flex-col items-center gap-2 py-4 px-2 fixed left-0 top-1/2 -translate-y-1/2 z-50"
      style={{
        background: "rgba(10,21,32,0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(201,163,90,0.12)",
        borderRadius: "0 20px 20px 0",
        boxShadow: "4px 0 32px rgba(0,0,0,0.3)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.id}
            href={item.href}
            className="relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all"
            title={item.label}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
                    boxShadow: "0 4px 16px rgba(13,79,60,0.4)",
                  }
                : { color: "var(--text3)" }
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {/* Tooltip */}
            <span
              className="absolute left-full ml-2 px-2 py-1 text-xs font-cairo rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: "rgba(10,21,32,0.95)",
                border: "1px solid rgba(201,163,90,0.2)",
                color: "var(--gold-light)",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── Mobile floating pill nav ─────────────────────────────────────────────────
function MobilePillNav({ pathname }: { pathname: string }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe pb-2 px-4">
      <div
        className="w-full max-w-sm flex items-center justify-around px-3 py-2 rounded-full"
        style={{
          background: "rgba(10,21,32,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(201,163,90,0.10)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all touch-manipulation",
                isActive ? "scale-100" : "opacity-60 hover:opacity-100"
              )}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="floating-nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
                      boxShadow: "0 4px 16px rgba(13,79,60,0.5)",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 text-base leading-none">{item.icon}</span>
              <span
                className={cn(
                  "relative z-10 text-[9px] mt-0.5 font-cairo font-semibold leading-tight",
                  isActive ? "text-[#E8F4EC]" : "text-[#4a6a5a]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── FloatingNav — exported component ────────────────────────────────────────
export function FloatingNav() {
  const pathname = usePathname();

  // Don't show nav on login page
  if (pathname === "/login") return null;

  return (
    <>
      <DesktopSideNav pathname={pathname} />
      <MobilePillNav pathname={pathname} />
    </>
  );
}
