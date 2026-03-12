"use client";

import * as React from "react";
import { Leaf, CheckCircle2, Loader2 } from "lucide-react";
import { PohonIman } from "@/components/specific/PohonIman";
import { Checkbox } from "@/components/ui/Checkbox";
import { motion, AnimatePresence } from "framer-motion";

// ─── Konstanta ────────────────────────────────────────────────────
const TOTAL_DAYS = 21;

import { hijrahMissions } from "@/lib/data/hijrah-missions";

// ─── Helpers ──────────────────────────────────────────────────────

/** Baca device user_id dari localStorage, atau buat via /api/hijrah-auth */
async function getOrCreateUserId(): Promise<string> {
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
        const progressRes = await fetch(`/api/hijrah-progress?user_id=${uid}`);
        const progressData = await progressRes.json();
        let day = progressData.current_day ?? 1;

        // 3. Ambil tasks yang sudah selesai hari ini
        let tasksRes = await fetch(`/api/hijrah-tasks?user_id=${uid}&day=${day}`);
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
          tasksRes = await fetch(`/api/hijrah-tasks?user_id=${uid}&day=${day}`);
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

  // ─── Toggle Task (optimistic update + Supabase sync) ─────────
  const handleToggleTask = async (taskId: string, _taskText: string) => {
    if (!userId || savingId !== null) return;

    const isCurrentlyDone = completedIds.has(taskId);
    setSavingId(taskId);

    // Optimistic update
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyDone) next.delete(taskId);
      else next.add(taskId);
      return next;
    });

    try {
      if (isCurrentlyDone) {
        // Batalkan centang
        await fetch("/api/hijrah-tasks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, day_number: currentDay, task_id: taskId }),
        });
      } else {
        // Tandai selesai
        await fetch("/api/hijrah-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, day_number: currentDay, task_id: taskId }),
        });
      }
    } catch (err) {
      // Rollback jika gagal
      console.error("[HijrahPage] Toggle error:", err);
      setCompletedIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyDone) next.add(taskId);
        else next.delete(taskId);
        return next;
      });
    } finally {
      setSavingId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <main className="flex flex-col min-h-screen px-6 pt-12 pb-32 gap-6 relative overflow-hidden max-w-7xl mx-auto w-full">

      {/* Header */}
      <header className="flex flex-col gap-2 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-primary mb-2 shadow-sm">
          <Leaf className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Jalur Hijrah
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Program {TOTAL_DAYS}-Hari: <span className="font-semibold text-foreground">Detox Penyakit Hati</span>.
        </p>
      </header>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex flex-col gap-4 mt-2">
          <div className="h-48 rounded-3xl bg-secondary/50 animate-pulse" />
          <div className="h-24 rounded-3xl bg-secondary/50 animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-secondary/50 animate-pulse" />
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
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                {plantLevel.emoji} {plantLevel.label}
              </span>
            </motion.div>

            {/* Overall Progress Bar */}
            <div className="mt-2 card-premium p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-light to-gold opacity-60" />
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-xs text-gold/80 font-medium uppercase tracking-wider mb-1">Progress Keseluruhan</p>
                  <p className="font-semibold text-lg text-foreground">
                    Hari ke-{currentDay} <span className="text-muted-foreground text-sm font-normal">/ {TOTAL_DAYS}</span>
                  </p>
                </div>
                <p className="text-gold font-bold">{Math.round(overallProgress)}%</p>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Progress hari ini */}
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted-foreground">
                  Misi hari ini: <span className="font-semibold text-foreground">{completedToday}/{currentMissions.length}</span> selesai
                </p>
                <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold"
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
            <h3 className="font-semibold text-lg text-foreground pl-1">Misi Hari Ini</h3>

            <div className="flex flex-col gap-3">
              {currentMissions.map((task) => {
                const isDone = completedIds.has(task.id);
                const isSaving = savingId === task.id;

                return (
                  <motion.button
                    key={task.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleTask(task.id, task.title)}
                    disabled={isSaving}
                    className={`flex items-center gap-3 p-4 card-premium rounded-2xl cursor-pointer transition-all group hover:border-gold/60 text-left w-full disabled:opacity-70 ${isDone ? "border-primary bg-primary/5" : ""
                      }`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 text-gold animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="pointer-events-none mt-0.5 flex-shrink-0">
                        <Checkbox
                          checked={isDone}
                          readOnly
                          className="border-gold text-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      </div>
                    )}
                    <span className={`text-base font-medium transition-colors ${isDone ? "text-primary/70 line-through" : "text-foreground group-hover:text-gold"
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
            className="fixed bottom-24 left-6 right-6 bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl flex items-center justify-between z-50 border border-primary-foreground/20"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-bold">Misi Hari Ini Selesai! 🎉</p>
                <p className="text-sm opacity-90">Alhamdulillah, istiqomahmu tercatat.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
