"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "orbit" | "view" | "action";

export function CustomCursor() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [mode, setMode] = useState<CursorMode>("default");

  // Punto central de 4px con seguimiento instantáneo
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Anillo orbital con seguimiento suave mediante useSpring
  const targetRingX = useMotionValue(-100);
  const targetRingY = useMotionValue(-100);
  const springConfig = { stiffness: 260, damping: 26 };
  const ringX = useSpring(targetRingX, springConfig);
  const ringY = useSpring(targetRingY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const updateEnabled = () => setEnabled(mediaQuery.matches);
    updateEnabled();

    mediaQuery.addEventListener("change", updateEnabled);
    return () => mediaQuery.removeEventListener("change", updateEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);

      dotX.set(e.clientX);
      dotY.set(e.clientY);
      targetRingX.set(e.clientX);
      targetRingY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const cursorEl = target?.closest<HTMLElement>("[data-cursor]") ?? null;
      const nextModeAttr = cursorEl?.getAttribute("data-cursor") as
        | CursorMode
        | null;

      if (
        nextModeAttr === "orbit" ||
        nextModeAttr === "view" ||
        nextModeAttr === "action"
      ) {
        setMode(nextModeAttr);
      } else {
        setMode("default");
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, [enabled, visible, dotX, dotY, targetRingX, targetRingY]);

  if (!enabled) return null;

  const isCircle = mode !== "view";

  const ringWidth =
    mode === "orbit"
      ? 64
      : mode === "view"
      ? 68
      : mode === "action"
      ? 14
      : 30;

  const ringHeight =
    mode === "orbit"
      ? 64
      : mode === "view"
      ? 30
      : mode === "action"
      ? 14
      : 30;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s ease" }}
    >
      {/* Punto central instantáneo de 4px */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: mode === "view" || mode === "orbit" ? 0 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="fixed left-0 top-0 h-1 w-1 bg-[#FFFFFF]"
      />

      {/* Anillo orbital contextual */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: ringWidth,
          height: ringHeight,
          backgroundColor:
            mode === "view"
              ? "#FFFFFF"
              : mode === "action"
              ? "rgba(255, 255, 255, 0.35)"
              : "rgba(255, 255, 255, 0)",
          borderColor:
            mode === "view" || mode === "action"
              ? "#FFFFFF"
              : "rgba(255, 255, 255, 0.35)",
        }}
        transition={{
          width: { type: "spring", stiffness: 360, damping: 28 },
          height: { type: "spring", stiffness: 360, damping: 28 },
          backgroundColor: { duration: 0.12 },
          borderColor: { duration: 0.12 },
        }}
        className={`fixed left-0 top-0 flex items-center justify-center border ${
          isCircle ? "cursor-ring-circle" : ""
        }`}
      >
        {mode === "orbit" && (
          <span className="font-sans font-medium text-[10px] tracking-[0.16em] uppercase text-[#FFFFFF]">
            GIRAR
          </span>
        )}
        {mode === "view" && (
          <span className="font-sans font-medium text-[10px] tracking-[0.16em] uppercase text-[#050505]">
            VER ↗
          </span>
        )}
      </motion.div>
    </div>
  );
}
