import * as React from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-col min-h-screen pb-32 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 w-full relative">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Profil</h1>

        <div className="card-premium bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-emerald-900/30 flex items-center justify-center text-primary dark:text-emerald-400 border border-primary/20 dark:border-emerald-800 shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{user.email}</h2>
            <div className="inline-flex mt-1 items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-bold tracking-widest uppercase border border-gold/20">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
              Premium Member
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-2">
            Pengaturan Akun
          </h3>
          
          <div className="bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-sm">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
