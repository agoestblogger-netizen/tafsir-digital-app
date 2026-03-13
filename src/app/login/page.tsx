"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error("Kredensial tidak valid. Silakan periksa email dan kata sandi Anda.");
      }

      router.push("/");
      router.refresh(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-6 bg-geometric-light relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm card-premium rounded-3xl p-8 relative z-10 shadow-2xl backdrop-blur-xl border border-border/50"
      >
        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center mb-4 shadow-inner bg-background/50">
            <span className="font-arabic text-3xl text-gold pt-1">﷽</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-center">
            Akses Tafsir Digital
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
            Silakan masuk dengan akun premium Anda untuk melanjutkan.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-3 text-destructive"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-muted-foreground/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-11 pr-4 py-3.5 bg-background shadow-inner border border-border/80 rounded-2xl text-base placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-muted-foreground/50" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-background shadow-inner border border-border/80 rounded-2xl text-base placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3.5 mt-2 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-[0_8px_16px_-6px_rgba(20,83,45,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(20,83,45,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Membuka Gerbang...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground/60 leading-relaxed font-medium">
            Aplikasi ini 100% eksklusif bagi<br/>pemegang akses Premium One-Time Purchase.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
