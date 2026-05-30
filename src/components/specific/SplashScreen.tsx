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
      setTimeout(() => {
        if (!ended) setVisible(false);
      }, duration);
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
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(160deg, #040a08 0%, #071510 50%, #040a08 100%)" }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(52,211,153,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-56 h-56 rounded-full"
            style={{ border: "1px dashed rgba(201,163,90,0.2)" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-72 h-72 rounded-full"
            style={{ border: "0.5px dashed rgba(52,211,153,0.12)" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center">

            {/* Bismillah */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(201,163,90,0.08)",
                border: "1px solid rgba(201,163,90,0.25)",
                boxShadow: "0 0 40px rgba(201,163,90,0.1)",
              }}
            >
              <span style={{ fontFamily: "Amiri, Georgia, serif", fontSize: "2.2rem", color: "#C9A84C" }}>
                ﷽
              </span>
            </motion.div>

            {/* Arabic greeting */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              style={{
                fontFamily: "Amiri, Georgia, serif",
                fontSize: "clamp(1.6rem, 7vw, 2.4rem)",
                color: "#C9A84C",
                lineHeight: 1.5,
              }}
            >
              السَّلَامُ عَلَيْكُمْ
            </motion.h1>

            {/* Latin greeting */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em" }}
            >
              Assalamu&apos;alaikum
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="w-24 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(201,163,90,0.5), transparent)" }}
            />

            {/* Username */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-base font-semibold capitalize"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {userName}
            </motion.p>

            {/* Dot pulse loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex gap-1.5 mt-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "rgba(52,211,153,0.6)" }}
                />
              ))}
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
