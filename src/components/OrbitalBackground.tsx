"use client";

import React from "react";
import { motion } from "framer-motion";

export function OrbitalBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Dos anillos orbitales gigantes ultrafinos */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "920px 440px" }}
        >
          <circle
            cx="920"
            cy="440"
            r="460"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        </motion.g>

        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "720px 450px" }}
        >
          <ellipse
            cx="720"
            cy="450"
            rx="680"
            ry="270"
            transform="rotate(-16 720 450)"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        </motion.g>
      </svg>
    </div>
  );
}
