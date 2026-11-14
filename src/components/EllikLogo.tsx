"use client";

import React from "react";

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

interface EllikLogoProps {
  className?: string;
}

export function EllikLogo({ className = "" }: EllikLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <EllikEmblem className="h-7 w-7 shrink-0 text-[var(--text-primary)]" />
      <span className="font-mono text-sm font-bold tracking-[0.25em] text-[var(--text-primary)]">
        ELLIK
      </span>
    </span>
  );
}
