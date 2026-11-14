"use client";

import React from "react";

interface EllikMarkProps {
  className?: string;
}

export function EllikMark({ className = "h-7 w-7" }: EllikMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Anillo orbital superior entrelazado */}
      <circle
        cx="33"
        cy="25"
        r="21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.42"
      />
      {/* Anillo orbital principal */}
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
      {/* Nodo cuadrado sólido en la cresta superior del anillo principal */}
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

interface EllikLogoProps {
  className?: string;
}

export function EllikLogo({ className = "" }: EllikLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <EllikMark className="h-7 w-7 shrink-0 text-[var(--text-primary)]" />
      <span className="font-mono text-sm font-bold tracking-[0.25em] text-[var(--text-primary)]">
        ELLIK
      </span>
    </span>
  );
}
