"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeckItem = {
  id: string;
  index: string;         // "01", "02", "03"
  name: string;          // Título de la modalidad
  eyebrow: string;       // Subtítulo corto en Satoshi
  summary: string;       // Descripción humana clara
  deliverables: string[];// 3 puntos concretos incluidos
  image: string;         // Captura real local de respaldo visual (/previews/...)
  accent: string;        // Color de acento del círculo con flecha
  ctaLabel: string;      // Ej: "Consultar esta modalidad"
  ctaSublabel: string;   // Ej: "Charla directa por WhatsApp"
  planKey: string;       // Clave para preseleccionar en ContactDrawer
  url?: string;          // Opcional si se usa con link externo
};

export interface ProjectDeckProps {
  items: DeckItem[];
  ground?: string;
  onSelectItem?: (item: DeckItem) => void;
  className?: string;
}

const ENTER = 0.72;

function smootherStep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/**
 * Progreso de entrada [0..1] de la tarjeta `cardIndex` (1..N-1).
 * La tarjeta base (0) ya está en posición al fijarse el mazo.
 */
function arrived(cardIndex: number, v: number, total: number): number {
  if (cardIndex <= 0) return 1;
  const steps = Math.max(1, total - 1);
  const segStart = (cardIndex - 1) / steps;
  const segSpan = (1 / steps) * ENTER;
  const raw = (v - segStart) / Math.max(segSpan, 0.0001);
  return smootherStep(raw);
}

const DECK_SCOPED_CSS = `
.ellik-deck-card {
  border-radius: 24px !important;
}
.ellik-deck-media {
  border-radius: 16px !important;
}
.ellik-deck-notch {
  border-top-left-radius: 24px !important;
}
.ellik-deck-orb {
  border-radius: 9999px !important;
}
`;

interface DeckCardProps {
  item: DeckItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  ground: string;
  reducedMotion: boolean;
  onSelectItem?: (item: DeckItem) => void;
}

function DeckCard({
  item,
  index,
  total,
  progress,
  ground,
  reducedMotion,
  onSelectItem,
}: DeckCardProps) {
  const above = (v: number): number => {
    let sum = 0;
    for (let j = index + 1; j < total; j++) {
      sum += arrived(j, v, total);
    }
    return sum;
  };

  const y = useTransform(progress, (v) => {
    if (reducedMotion) return "0svh";
    const a = arrived(index, v, total);
    const enterY = index === 0 ? 0 : (1 - a) * 96;
    const stackY = -above(v) * 4.5;
    return `${(enterY + stackY).toFixed(3)}svh`;
  });

  const scale = useTransform(progress, (v) => {
    if (reducedMotion) return 1;
    const ab = above(v);
    return Math.max(0.88, 1 - ab * 0.045);
  });

  const rotateX = useTransform(progress, (v) => {
    if (reducedMotion) return 0;
    const a = arrived(index, v, total);
    const ab = above(v);
    const enterTilt = index === 0 ? 0 : (1 - a) * -16;
    const stackTilt = Math.min(3, ab * 1.5);
    return enterTilt + stackTilt;
  });

  const overlayDim = useTransform(progress, (v) => {
    if (reducedMotion) return 0;
    const ab = above(v);
    return Math.min(0.36, ab * 0.16);
  });

  const handleAction = () => {
    if (onSelectItem) {
      onSelectItem(item);
      return;
    }
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.article
      data-deck-card={index}
      style={{
        y,
        scale,
        rotateX,
        zIndex: index + 1,
        transformOrigin: "50% 0%",
      }}
      data-cursor="action"
      onClick={handleAction}
      className={cn(
        "ellik-deck-card group/card relative w-full overflow-hidden cursor-pointer select-none flex flex-col",
        "bg-[#09090C] text-[#F4F1EA] border border-white/[0.14]",
        "shadow-[0_24px_64px_rgba(5,5,5,0.34)] will-change-transform",
        reducedMotion
          ? "relative mb-8 min-h-[460px]"
          : "absolute inset-x-0 bottom-0 h-[64svh] sm:h-[66svh] lg:h-[68svh] min-h-[430px] max-h-[620px]"
      )}
    >
      {/* Oscurecimiento progresivo por opacidad (sin filter: blur para 60fps en GPU) */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: overlayDim }}
        className="pointer-events-none absolute inset-0 z-30 bg-black"
      />

      {/* Solapa superior sutil y compacta (h-10): solo índice + nombre */}
      <div className="relative z-20 shrink-0 flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 sm:px-8 h-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-sans font-medium tabular-nums text-[11px] tracking-[0.14em] text-white/45 shrink-0">
            {item.index}
          </span>
          <span className="font-sans font-medium text-xs tracking-[0.04em] text-[#F4F1EA]/85 truncate">
            {item.name}
          </span>
        </div>

        <span className="hidden md:inline-block font-sans text-[11px] uppercase tracking-[0.08em] text-white/35 truncate">
          {item.eyebrow}
        </span>
      </div>

      {/* Cuerpo principal de la tarjeta */}
      <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 px-5 sm:px-8 lg:px-10 pt-5 sm:pt-7 pb-20 sm:pb-24 lg:pb-12">
        {/* Columna izquierda: Título, Resumen y 3 entregables (sin botón duplicado) */}
        <div className="lg:col-span-6 flex flex-col justify-start min-h-0">
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-[-0.03em] leading-[1.02] text-white">
            {item.name}
          </h3>

          <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#F4F1EA]/75 max-w-xl">
            {item.summary}
          </p>

          <ul className="mt-5 sm:mt-6 space-y-2.5 border-t border-white/[0.08] pt-4 sm:pt-5">
            {item.deliverables.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 font-sans text-xs sm:text-sm md:text-[15px] leading-snug text-[#F4F1EA]/85"
              >
                <span
                  className="ellik-deck-orb mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center border border-white/20 bg-white/[0.05]"
                  style={{ color: item.accent }}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha: Captura limpia de producción (sin badge encima) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center min-h-0 pb-14">
          <div className="ellik-deck-media relative aspect-[16/10] w-full overflow-hidden border border-white/12 bg-[#121217] shadow-[0_18px_48px_rgba(0,0,0,0.55)]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 480px, 400px"
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03]"
            />
          </div>
        </div>
      </div>

      {/* Único CTA en la esquina inferior derecha troquelada (ground #F4F1EA, R=20) */}
      <div
        className="ellik-deck-notch absolute bottom-0 right-0 z-20"
        style={{ backgroundColor: ground }}
      >
        {/* Filete cóncavo superior derecho (R=20) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute -top-[20px] right-0 h-[20px] w-[20px]"
        >
          <path d="M20 0v20H0C11.046 20 20 11.046 20 0Z" fill={ground} />
        </svg>

        {/* Filete cóncavo inferior izquierdo (R=20) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute bottom-0 -left-[20px] h-[20px] w-[20px]"
        >
          <path d="M20 0v20H0C11.046 20 20 11.046 20 0Z" fill={ground} />
        </svg>

        <button
          type="button"
          data-deck-cta={item.id}
          data-cursor="action"
          aria-label={`${item.ctaLabel} — ${item.name}`}
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
          className="group/cta relative flex items-center gap-3.5 sm:gap-4 pl-5 pr-3 pt-3.5 pb-2.5 sm:pl-6 sm:pr-4 sm:pt-4 sm:pb-3 text-left focus:outline-none"
        >
          <div>
            <span className="block font-display font-semibold text-[#050505] text-[15px] sm:text-[17px] leading-tight whitespace-nowrap">
              {item.ctaLabel}
            </span>
            <span className="block font-sans text-[#52525B] text-[12px] sm:text-[13px] leading-snug whitespace-nowrap">
              {item.ctaSublabel}
            </span>
          </div>

          <span
            style={{ backgroundColor: item.accent }}
            className="ellik-deck-orb flex h-12 w-12 shrink-0 items-center justify-center text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
          >
            <ArrowUpRight className="h-5 w-5 text-white stroke-[2] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:rotate-45 group-hover/cta:rotate-45" />
          </span>
        </button>
      </div>
    </motion.article>
  );
}

export function ProjectDeck({
  items,
  ground = "#F4F1EA",
  onSelectItem,
  className,
}: ProjectDeckProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = Boolean(useReducedMotion());

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 520,
    damping: 46,
    mass: 0.15,
  });

  if (!items.length) return null;

  return (
    <MotionConfig reducedMotion="user">
      <style>{DECK_SCOPED_CSS}</style>
      <div
        ref={containerRef}
        style={{
          height: reducedMotion ? "auto" : `${items.length * 115}svh`,
        }}
        className={cn("relative w-full", className)}
      >
        <div
          className={cn(
            "w-full",
            reducedMotion
              ? "relative"
              : "sticky top-0 h-[100svh] pt-14 pb-20 lg:pb-8 flex items-end justify-center"
          )}
          style={
            reducedMotion
              ? undefined
              : {
                  perspective: "1800px",
                }
          }
        >
          <div className="relative w-full h-full flex items-end">
            {items.map((item, idx) => (
              <DeckCard
                key={item.id}
                item={item}
                index={idx}
                total={items.length}
                progress={smoothProgress}
                ground={ground}
                reducedMotion={reducedMotion}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default ProjectDeck;
