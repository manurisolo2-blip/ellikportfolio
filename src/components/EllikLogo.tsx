"use client";

import React from "react";

interface EllikLogoProps {
  className?: string;
}

export function EllikLogo({ className = "" }: EllikLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Anillo orbital exterior */}
        <circle
          cx="13.5"
          cy="14.5"
          r="10.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.9"
        />
        {/* Anillo orbital interior ligeramente descentrado (eclipse minimalista) */}
        <circle
          cx="11.5"
          cy="15.5"
          r="6.25"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.48"
        />
        {/* Punto estelar sólido de 3px en el cuadrante superior derecho */}
        <circle cx="21.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>

      <span className="font-mono text-sm font-bold tracking-[0.25em] text-[var(--text-primary)]">
        ELLIK
      </span>
    </span>
  );
}
