"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch - only render after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-[100] w-10 h-10 p-2 rounded-full bg-white/50 border border-border/50 shadow-sm animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="fixed top-4 right-4 z-[100] p-2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center hover:scale-105 transition-all duration-200"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}
