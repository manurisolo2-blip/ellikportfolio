"use client";

import React from "react";
import { motion } from "framer-motion";

interface EllikEmblemProps {
  size?: number;
  className?: string;
}

/** Emblema orbital oficial de ELLIK (anillos excéntricos y nodos satelitales). */
export function EllikEmblem({ size, className = "h-7 w-7" }: EllikEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Anillo orbital exterior superior entrelazado */}
      <circle
        cx="33"
        cy="25"
        r="21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.42"
      />
      {/* Anillo orbital intermedio / principal */}
      <circle
        cx="30"
        cy="36"
        r="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.95"
      />
      {/* Anillo interior excéntrico */}
      <circle
        cx="25.5"
        cy="38.5"
        r="12.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.58"
      />
      {/* Nodo cuadrado sólido en la cresta superior */}
      <rect
        x="23.5"
        y="11.5"
        width="7.5"
        height="7.5"
        fill="currentColor"
      />
      {/* Nodo satelital circular en el cuadrante superior derecho */}
      <circle cx="44.8" cy="21.2" r="3.2" fill="currentColor" />
    </svg>
  );
}

/** Alias de compatibilidad para usos existentes del isotipo. */
export const EllikMark = EllikEmblem;

interface EllikSolarGyroscopeProps {
  className?: string;
}

/**
 * El Sol del Sistema ELLIK: giroscopio astronómico 3D real con los 3 anillos excéntricos
 * girando sobre ejes independientes (rotateX, rotateY, rotateZ), nodo cuadrado, satélite
 * y resplandor de corona estelar detrás.
 */
export function EllikSolarGyroscope({
  className = "",
}: EllikSolarGyroscopeProps) {
  return (
    <div
      aria-hidden="true"
      style={{ perspective: "900px", transformStyle: "preserve-3d" }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Corona estelar luminosa detrás del giroscopio (SVG circular inmunizada contra border-radius: 0px) */}
      <motion.svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ scale: [0.96, 1.05, 0.96], opacity: [0.78, 1, 0.78] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -inset-10 h-[calc(100%+5rem)] w-[calc(100%+5rem)] will-change-transform"
      >
        <defs>
          <radialGradient id="ellik-solar-corona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.34)" />
            <stop offset="22%" stopColor="rgba(244, 241, 234, 0.20)" />
            <stop offset="52%" stopColor="rgba(244, 241, 234, 0.06)" />
            <stop offset="82%" stopColor="rgba(22, 42, 78, 0.05)" />
            <stop offset="100%" stopColor="rgba(5, 5, 5, 0)" />
          </radialGradient>
        </defs>
        <circle cx="120" cy="120" r="118" fill="url(#ellik-solar-corona)" />
      </motion.svg>

      {/* Núcleo luminoso central del sol */}
      <svg
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="ellik-solar-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="28%" stopColor="#F4F1EA" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#F4F1EA" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="64" cy="64" r="24" fill="url(#ellik-solar-core)" />
      </svg>

      {/* Anillo 1 (Exterior excéntrico): Precesión oblicua sobre X, Y y Z */}
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [58, 70, 58],
          rotateY: [-28, 332],
          rotateZ: [0, 360],
        }}
        transition={{
          rotateX: { duration: 14, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 22, repeat: Infinity, ease: "linear" },
          rotateZ: { duration: 28, repeat: Infinity, ease: "linear" },
        }}
        className="absolute inset-0 will-change-transform"
      >
        <svg viewBox="0 0 128 128" fill="none" className="h-full w-full">
          <circle
            cx="66"
            cy="52"
            r="44"
            stroke="rgba(244, 241, 234, 0.56)"
            strokeWidth="1.35"
          />
          {/* Pequeño satélite sobre el plano orbital externo */}
          <circle cx="96" cy="24" r="3.4" fill="#F4F1EA" />
        </svg>
      </motion.div>

      {/* Anillo 2 (Anillo principal): Rotación giroscópica con el nodo cuadrado en cresta */}
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [-38, -22, -38],
          rotateY: [24, -336],
          rotateZ: [0, -360],
        }}
        transition={{
          rotateX: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 18, repeat: Infinity, ease: "linear" },
          rotateZ: { duration: 24, repeat: Infinity, ease: "linear" },
        }}
        className="absolute inset-0 will-change-transform"
      >
        <svg viewBox="0 0 128 128" fill="none" className="h-full w-full">
          <circle
            cx="61"
            cy="70"
            r="41"
            stroke="#FFFFFF"
            strokeWidth="1.9"
            strokeOpacity="0.95"
          />
          {/* Nodo cuadrado sólido en la cresta orbital */}
          <rect x="49" y="23.5" width="9.5" height="9.5" fill="#FFFFFF" />
          {/* Segundo nodo satelital en el cuadrante superior derecho */}
          <circle cx="91.5" cy="40.5" r="4.2" fill="#FFFFFF" />
        </svg>
      </motion.div>

      {/* Anillo 3 (Interior excéntrico): Giro rápido alrededor del núcleo luminoso */}
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [24, -24, 24],
          rotateY: [0, 360],
          rotateZ: [18, 378],
        }}
        transition={{
          rotateX: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 14, repeat: Infinity, ease: "linear" },
          rotateZ: { duration: 16, repeat: Infinity, ease: "linear" },
        }}
        className="absolute inset-0 will-change-transform"
      >
        <svg viewBox="0 0 128 128" fill="none" className="h-full w-full">
          <circle
            cx="54"
            cy="74"
            r="25.5"
            stroke="rgba(244, 241, 234, 0.85)"
            strokeWidth="1.6"
          />
        </svg>
      </motion.div>
    </div>
  );
}

interface EllikLogoProps {
  className?: string;
}

export function EllikLogo({ className = "" }: EllikLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <EllikEmblem className="h-7 w-7 shrink-0 text-current" />
      <span className="font-mono text-sm font-bold tracking-[0.25em] text-current">
        ELLIK
      </span>
    </span>
  );
}
