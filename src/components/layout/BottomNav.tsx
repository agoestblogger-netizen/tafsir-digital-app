"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookOpenCheck, Sprout, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Surah", href: "/surah", icon: Compass },
  { name: "Cari", href: "/search", icon: BookOpenCheck },
  { name: "Hijrah", href: "/hijrah", icon: Sprout },
  { name: "Profil", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-7xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-3 flex justify-between items-center md:rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-12 gap-1 touch-manipulation">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl transition-colors",
                  isActive ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              </motion.div>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
