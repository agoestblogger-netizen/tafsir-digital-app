"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { SplashScreen } from "@/components/specific/SplashScreen";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSplash, setShowSplash] = React.useState(false);
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

      setShowSplash(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen userName={email.split("@")[0]} />}
      <main
      className="flex flex-col min-h-screen items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #030e0a 0%, #060d12 45%, #061510 100%)",
      }}
    >
      {/* Arabesque pattern */}
      <div className="arabesque-bg opacity-60" />

      {/* Radial glow decorations */}
      <div
        className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,163,90,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(13,79,60,0.12) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[360px]"
        style={{
          background: "rgba(10,21,32,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(201,163,90,0.25)",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,163,90,0.1)",
          padding: "40px 36px",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-amiri text-3xl text-center"
            style={{ color: "var(--gold-light)", textShadow: "0 0 20px rgba(201,163,90,0.4)" }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </motion.p>

          <h1
            className="font-cinzel text-center font-semibold text-lg tracking-wide mt-2"
            style={{ color: "var(--gold-light)" }}
          >
            Quranic Life Hacking
          </h1>
          <p
            className="text-xs text-center tracking-[0.15em] uppercase font-cairo"
            style={{ color: "rgba(201,163,90,0.5)" }}
          >
            Premium Access
          </p>
        </div>

        {/* Divider */}
        <div className="arabic-divider mb-6" />

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3 rounded-xl flex gap-2 items-start text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-cairo">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold font-cairo tracking-widest ml-1"
              style={{ color: "rgba(201,163,90,0.7)" }}
            >
              EMAIL
            </label>
            <div className="relative flex items-center">
              <Mail
                className="absolute left-4 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text3)" }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-11 pr-4 py-3 text-sm font-cairo transition-all focus:outline-none"
                style={{
                  background: "rgba(14,30,42,0.8)",
                  border: "1px solid rgba(201,163,90,0.2)",
                  borderRadius: "12px",
                  color: "var(--text1)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(201,163,90,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,163,90,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(201,163,90,0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold font-cairo tracking-widest ml-1"
              style={{ color: "rgba(201,163,90,0.7)" }}
            >
              KATA SANDI
            </label>
            <div className="relative flex items-center">
              <Lock
                className="absolute left-4 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text3)" }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 text-sm font-cairo transition-all focus:outline-none"
                style={{
                  background: "rgba(14,30,42,0.8)",
                  border: "1px solid rgba(201,163,90,0.2)",
                  borderRadius: "12px",
                  color: "var(--text1)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(201,163,90,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,163,90,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(201,163,90,0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3.5 mt-1 font-cairo font-bold text-sm transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--teal-600) 0%, var(--teal-500) 100%)",
              borderRadius: "12px",
              color: "var(--text1)",
              boxShadow: "0 4px 16px rgba(13,79,60,0.4)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuka Gerbang...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="arabic-divider mb-4" />
          <p
            className="text-xs font-cairo"
            style={{ color: "rgba(201,163,90,0.4)" }}
          >
            Akses Eksklusif &middot; Premium Member
          </p>
        </div>
      </motion.div>
    </main>
    </>
  );
}
