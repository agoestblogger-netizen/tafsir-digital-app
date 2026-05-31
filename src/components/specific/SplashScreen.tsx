"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  userName?: string;
}

export function SplashScreen({ userName = "Hamba Allah" }: SplashScreenProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
    let ended = false;
    const audio = new Audio("/sounds/salam.wav");
    audio.volume = 0.85;

    audio.addEventListener("ended", () => {
      ended = true;
      setTimeout(() => setVisible(false), 600);
    });

    audio.addEventListener("loadedmetadata", () => {
      const duration = (audio.duration || 4) * 1000 + 800;
      setTimeout(() => { if (!ended) setVisible(false); }, duration);
    });

    audio.play().catch(() => {
      setTimeout(() => setVisible(false), 3500);
    });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-hidden py-16 px-8"
          style={{ background: "linear-gradient(180deg, #020c07 0%, #051a0e 50%, #020c07 100%)" }}
        >

          {/* ── TOP: App branding ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-col items-center gap-1"
          >
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase"
              style={{ color: "rgba(201,163,90,0.5)" }}>
              بِسْمِ اللَّهِ
            </p>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase"
              style={{ color: "rgba(201,163,90,0.7)" }}>
              Quranic Life Hacking
            </p>
          </motion.div>

          {/* ── MIDDLE: Mandala ornament ──────────────────────── */}
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

            {/* Outer slow ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute rounded-full"
              style={{
                width: 210, height: 210,
                border: "1px dashed rgba(201,163,90,0.2)",
              }}
            />

            {/* Mid pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full"
              style={{
                width: 170, height: 170,
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            />

            {/* Inner counter-rotate ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute rounded-full"
              style={{ width: 140, height: 140 }}
            >
              <svg viewBox="0 0 140 140" style={{ width: "100%", height: "100%" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={70 + 66 * Math.cos((i * Math.PI * 2) / 8)}
                    cy={70 + 66 * Math.sin((i * Math.PI * 2) / 8)}
                    r="3"
                    fill="rgba(201,163,90,0.5)"
                  />
                ))}
                <circle cx="70" cy="70" r="65" fill="none"
                  stroke="rgba(201,163,90,0.15)" strokeWidth="1" />
              </svg>
            </motion.div>

            {/* 8-point star */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute"
              style={{ width: 100, height: 100 }}
            >
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                <polygon
                  points="50,5 58,35 88,25 68,50 88,75 58,65 50,95 42,65 12,75 32,50 12,25 42,35"
                  fill="none" stroke="rgba(201,163,90,0.35)" strokeWidth="1.5"
                />
              </svg>
            </motion.div>

            {/* Center glowing circle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 120 }}
              className="relative z-10 rounded-full flex items-center justify-center"
              style={{
                width: 80, height: 80,
                background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, rgba(201,163,90,0.08) 100%)",
                border: "1.5px solid rgba(201,163,90,0.5)",
                boxShadow: "0 0 30px rgba(52,211,153,0.15), 0 0 60px rgba(201,163,90,0.08)",
              }}
            >
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: "2rem" }}
              >
                ☪️
              </motion.span>
            </motion.div>

          </div>

          {/* ── BOTTOM: Greeting ──────────────────────────────── */}
          <div className="flex flex-col items-center gap-3">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Assalamu&apos;alaikum,
              </p>
              <p className="text-2xl font-bold capitalize" style={{ color: "#ffffff" }}>
                {userName}
              </p>
            </motion.div>

            {/* Divider line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              style={{
                width: 60, height: 1,
                background: "linear-gradient(90deg, transparent, rgba(201,163,90,0.6), transparent)",
              }}
            />

            {/* Dot loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: "rgba(52,211,153,0.8)" }}
                />
              ))}
            </motion.div>

          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
