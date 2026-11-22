"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "framer-motion";

declare global {
  interface Window {
    __ellikLenis?: Lenis;
  }
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.115,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.25,
      smoothWheel: true,
      syncTouch: false,
    });

    window.__ellikLenis = lenis;

    let isRunning = false;

    const update = (data: { timestamp: number }) => {
      lenis.raf(data.timestamp);
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        frame.update(update, true);
      }
    };

    const stopLoop = () => {
      if (isRunning) {
        isRunning = false;
        cancelFrame(update);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    if (!document.hidden) {
      startLoop();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopLoop();
      if (window.__ellikLenis === lenis) {
        delete window.__ellikLenis;
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
