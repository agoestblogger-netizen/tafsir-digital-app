"use client";

import * as React from "react";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full flex items-center justify-between p-4 hover:bg-red-50/50 transition-colors text-left disabled:opacity-50"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-600 border border-red-200/50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-red-600">Keluar / Logout</span>
          <span className="text-xs text-muted-foreground mt-0.5">Akhiri sesi premium saat ini</span>
        </div>
      </div>
    </button>
  );
}
