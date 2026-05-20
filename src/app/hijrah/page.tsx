"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PohonIman } from "@/components/specific/PohonIman";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Konstanta ────────────────────────────────────────────────────
const TOTAL_DAYS = 21;

import { hijrahMissions } from "@/lib/data/hijrah-missions";
import { createClient } from "@/lib/supabase/client";

// ─── Helpers ──────────────────────────────────────────────────────

/** Baca device user_id dari localStorage, atau buat via /api/hijrah-auth */
async function getOrCreateUserId(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    // Selalu prioritaskan user Supabase asli
    return user.id;
  }

  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("hijrah_user_id");
  if (stored) return stored;

  // Buat ghost Supabase Auth user untuk device anonim ini
  const res = await fetch("/api/hijrah-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const { user_id } = await res.json();
  if (user_id) localStorage.setItem("hijrah_user_id", user_id);
  return user_id || "";
}

/** Label level gamifikasi tanaman */
function getPlantLevel(progress: number): { emoji: string; label: string } {
  if (progress <= 30) return { emoji: "🌱", label: "Benih Niat" };
  if (progress <= 60) return { emoji: "🌿", label: "Tunas Kesungguhan" };
  if (progress <= 90) return { emoji: "🪴", label: "Pohon Istiqomah" };
  return { emoji: "🌳", label: "Buah Ketaqwaan" };
}

// ─── Page Component ───────────────────────────────────────────────
export default function HijrahPage() {
  const router = useRouter();
  const [userId, setUserId] = React.useState<string>("");
  const [currentDay, setCurrentDay] = React.useState<number>(1);
  const [completedIds, setCompletedIds] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [savingId, setSavingId] = React.useState<string | null>(null); // task sedang disimpan

  // ─── Init: baca device_id → fetch progress → fetch tasks ────────
  React.useEffect(() => {
    async function init() {
      try {
        // 1. Dapatkan/buat ghost user di Supabase Auth
        const uid = await getOrCreateUserId();
        setUserId(uid);
        if (!uid) throw new Error("Gagal mendapatkan user_id");

        // 2. Ambil / buat progress hari ini
        const progressRes = await fetch(`/api/hijrah-progress?user_id=${uid}`, { cache: "no-store" });
        const progressData = await progressRes.json();
        let day = progressData.current_day ?? 1;

        // 3. Ambil tasks yang sudah selesai hari ini
        let tasksRes = await fetch(`/api/hijrah-tasks?user_id=${uid}&day=${day}`, { cache: "no-store" });
        let tasksData = await tasksRes.json();
        let ids: string[] = tasksData.completed_task_ids ?? [];

        // 4. Cek Auto-advance hari
        let missionsForDay = hijrahMissions[day] || [];
        // Selama misi ada && semua terselesaikan && belum tamat, naikkan currentDay
        while (missionsForDay.length > 0 && ids.length >= missionsForDay.length && day < TOTAL_DAYS) {
          day += 1;
          
          // Update ke database permanen
          await fetch("/api/hijrah-progress", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: uid, current_day: day }),
          });

          // Fetch state hari yang baru
          tasksRes = await fetch(`/api/hijrah-tasks?user_id=${uid}&day=${day}`, { cache: "no-store" });
          tasksData = await tasksRes.json();
          ids = tasksData.completed_task_ids ?? [];
          missionsForDay = hijrahMissions[day] || [];
        }

        setCurrentDay(day);
        setCompletedIds(new Set(ids));
      } catch (err) {
        console.error("[HijrahPage] Init error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // ─── Hitung progress ──────────────────────────────────────────
  const currentMissions = hijrahMissions[currentDay] || [];
  const completedToday = completedIds.size;
  const progressToday = currentMissions.length > 0 ? Math.round((completedToday / currentMissions.length) * 100) : 0;
  const overallProgress = Math.min(
    100,
    Math.round(((currentDay - 1) / TOTAL_DAYS) * 100) + Math.round(progressToday / TOTAL_DAYS)
  );
  const allDone = currentMissions.length > 0 && completedToday === currentMissions.length;
  const plantLevel = getPlantLevel(overallProgress);

  // ─── Toggle Task (NO Optimistic UI, Pure Supabase Truth) ─────────
  const handleToggleTask = async (taskId: string) => {
    if (!userId || savingId !== null) return;

    const isCurrentlyDone = completedIds.has(taskId);
    setSavingId(taskId);

    try {
      let response;
      if (isCurrentlyDone) {
        // Batalkan centang
        response = await fetch("/api/hijrah-tasks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, day_number: currentDay, task_id: taskId }),
        });
      } else {
        // Tandai selesai
        response = await fetch("/api/hijrah-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, day_number: currentDay, task_id: taskId }),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal update task");
      }

      // Revalidate UI from server!
      router.refresh();

      // Update state local *hanya* jika fetch valid
      setCompletedIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyDone) next.delete(taskId);
        else next.add(taskId);
        return next;
      });

    } catch (err) {
      console.error("[HijrahPage] Toggle error:", err);
      alert("Gagal menyimpan progres. Silakan coba lagi.");
    } finally {
      setSavingId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[var(--dark)] relative overflow-x-hidden pb-32 px-6 pt-12 max-w-7xl mx-auto w-full">

      {/* Header */}
      <header className="flex flex-col relative z-10 text-center mb-8 mt-6">
        <p
          className="font-amiri text-2xl md:text-3xl text-right leading-loose text-[var(--gold-light)]"
          dir="rtl"
        >
          وَمَن يُهَاجِرْ فِي سَبِيلِ اللَّهِ يَجِدْ فِي الْأَرْضِ مُرَاغَمًا كَثِيرًا وَسَعَةً
        </p>
        <p className="font-cairo text-sm italic text-[var(--teal-300)] text-right opacity-85 mt-1 mb-8">
          &quot;Barangsiapa berhijrah di jalan Allah, niscaya mereka mendapati di muka bumi ini tempat hijrah yang luas&quot; — QS. An-Nisa&apos;: 100
        </p>

        <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--gold-light)] mb-2">
          Hijrah Tracker
        </h1>
        <p className="font-cairo text-base text-[var(--text2)]">
          Pantau perjalanan hijrahmu, satu langkah dalam satu waktu. Program {TOTAL_DAYS}-Hari: <span className="font-bold text-[var(--text1)]">Detox Penyakit Hati</span>.
        </p>
      </header>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex flex-col gap-4 mt-2">
          <div className="h-48 rounded-3xl bg-[var(--dark2)] animate-pulse border border-[var(--gold-border)]" />
          <div className="h-24 rounded-3xl bg-[var(--dark2)] animate-pulse border border-[var(--gold-border)]" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-[var(--dark2)] animate-pulse border border-[var(--gold-border)]" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 w-full relative z-10">
          {/* Pohon Iman Visualization */}
          <section className="relative mt-2">
            <PohonIman progress={overallProgress} />

            {/* Level label gamifikasi */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center -mt-4 mb-2"
            >
              <span className="font-cairo inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[var(--gold-border)] text-[var(--gold)] bg-[var(--gold-pale)] text-sm font-bold">
                {plantLevel.emoji} {plantLevel.label}
              </span>
            </motion.div>

            {/* Overall Progress Bar */}
            <div className="mt-2 rounded-2xl border p-5 relative overflow-hidden shadow-sm" style={{ background: "rgba(10,21,32,0.85)", borderColor: "rgba(201,163,90,0.15)" }}>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--gold-light)] to-[var(--gold)] opacity-60" />
              <div className="flex justify-between items-end mb-3 pl-2">
                <div>
                  <p className="font-cinzel text-xs text-[var(--text3)] uppercase tracking-widest mb-1">Progress Keseluruhan</p>
                  <p className="font-cairo font-bold text-lg text-[var(--text1)]">
                    Hari ke-{currentDay} <span className="text-[var(--text2)] text-sm font-normal">/ {TOTAL_DAYS}</span>
                  </p>
                </div>
                <p className="font-cairo font-bold text-[var(--gold)]">{Math.round(overallProgress)}%</p>
              </div>
              <div className="h-2 w-full bg-[var(--dark2)] rounded-full overflow-hidden ml-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--teal-300)] to-[var(--gold)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Progress hari ini */}
              <div className="flex justify-between items-center mt-4 pl-2">
                <p className="font-cairo text-xs text-[var(--text2)]">
                  Misi hari ini: <span className="font-bold text-[var(--text1)]">{completedToday}/{currentMissions.length}</span> selesai
                </p>
                <div className="h-2 w-24 bg-[var(--dark2)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--teal-300)] to-[var(--teal-400)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToday}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Daily Tasks */}
          <section className="relative z-10 mt-4 flex flex-col gap-4">
            <h3 className="font-cinzel text-xl font-bold text-[var(--text1)] mb-1 pl-1">Misi Hari Ini</h3>

            <div className="flex flex-col gap-3">
              {currentMissions.map((task) => {
                const isDone = completedIds.has(task.id);
                const isSaving = savingId === task.id;

                return (
                  <motion.button
                    key={task.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleTask(task.id)}
                    disabled={isSaving}
                    className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all group text-left w-full disabled:opacity-70 ${
                      isDone 
                        ? "border border-[var(--teal-300)] bg-[var(--dark2)] shadow-[0_0_10px_rgba(26,170,120,0.2)]" 
                        : "border bg-[rgba(10,21,32,0.85)] border-[rgba(201,163,90,0.15)] hover:border-[var(--teal-300)]/50"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 text-[var(--gold)] animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="pointer-events-none mt-0.5 flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isDone 
                            ? "bg-[var(--teal-300)] border-[var(--teal-300)] text-[var(--dark)]" 
                            : "bg-transparent border-[var(--gold-border)]"
                        }`}>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    )}
                    <span className={`font-cairo text-base leading-relaxed transition-colors ${
                      isDone 
                        ? "text-[var(--teal-300)] opacity-80 line-through" 
                        : "text-[var(--text1)] group-hover:text-[var(--gold)]"
                    }`}>
                      {task.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Celebration overlay */}
      <AnimatePresence>
        {allDone && !isLoading && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-6 right-6 p-4 rounded-2xl shadow-[0_0_30px_rgba(26,170,120,0.3)] flex items-center justify-between z-50 border border-[var(--teal-300)]/50"
            style={{ background: "rgba(10,21,32,0.95)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[var(--teal-300)]" />
              <div>
                <p className="font-cinzel font-bold text-[var(--text1)]">Misi Hari Ini Selesai! 🎉</p>
                <p className="font-cairo text-sm text-[var(--teal-200)] opacity-90">Alhamdulillah, istiqomahmu tercatat.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
