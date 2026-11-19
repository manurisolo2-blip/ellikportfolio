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
  ctaLabel: string;      // Ej: "Consultar alcance"
  ctaSublabel: string;   // Ej: "Respuesta directa por WhatsApp"
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

function easeOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
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
  return easeOut(raw);
}

const DECK_SCOPED_CSS = `
.ellik-deck-card {
  border-radius: 26px !important;
}
.ellik-deck-media {
  border-radius: 16px !important;
}
.ellik-deck-notch {
  border-top-left-radius: 30px !important;
}
.ellik-deck-orb {
  border-radius: 9999px !important;
}
.ellik-deck-badge {
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
    const enterY = index === 0 ? 0 : (1 - a) * 94;
    const stackY = -above(v) * 5.2;
    return `${(enterY + stackY).toFixed(3)}svh`;
  });

  const scale = useTransform(progress, (v) => {
    if (reducedMotion) return 1;
    const ab = above(v);
    return Math.max(0.86, 1 - ab * 0.045);
  });

  const rotateX = useTransform(progress, (v) => {
    if (reducedMotion) return 0;
    const a = arrived(index, v, total);
    const ab = above(v);
    const enterTilt = index === 0 ? 0 : (1 - a) * 7;
    const stackTilt = -ab * 3.5;
    return enterTilt + stackTilt;
  });

  const overlayDim = useTransform(progress, (v) => {
    if (reducedMotion) return 0;
    const ab = above(v);
    return Math.min(0.38, ab * 0.15);
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
        "shadow-[0_28px_72px_rgba(5,5,5,0.4)] will-change-transform",
        reducedMotion
          ? "relative mb-8 min-h-[500px]"
          : "absolute inset-x-0 bottom-0 h-[72svh] min-h-[500px] max-h-[680px]"
      )}
    >
      {/* Oscurecimiento progresivo cuando entran tarjetas encima */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: overlayDim }}
        className="pointer-events-none absolute inset-0 z-30 bg-black"
      />

      {/* Resplandor superior sutil con el color de acento de la tarjeta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-10 h-64 w-96 opacity-20 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${item.accent} 0%, transparent 70%)`,
        }}
      />

      {/* Franja superior visible cuando la tarjeta queda apilada detrás (-5.2svh) */}
      <div className="relative z-20 shrink-0 flex items-center justify-between gap-3 border-b border-white/[0.09] px-6 sm:px-9 md:px-12 h-12 sm:h-14">
        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className="ellik-deck-badge inline-flex h-6 sm:h-7 px-3 items-center justify-center font-sans font-semibold tabular-nums text-[11px] sm:text-xs tracking-[0.16em] text-[#050505] shrink-0"
            style={{ backgroundColor: item.accent }}
          >
            {item.index}
          </span>
          <span className="font-sans font-medium text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#F4F1EA]/85 truncate">
            {item.eyebrow}
          </span>
        </div>

        <span className="hidden sm:inline-block font-sans font-medium tabular-nums text-xs uppercase tracking-[0.14em] text-white/45 shrink-0">
          MODALIDAD {item.index} / 0{total}
        </span>
      </div>

      {/* Cuerpo principal de la tarjeta */}
      <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 p-6 sm:p-9 md:p-11 xl:p-14 pb-8 sm:pb-11">
        {/* Columna izquierda: Título, Resumen, Entregables y CTA */}
        <div className="lg:col-span-6 flex flex-col justify-between min-h-0 pr-0 sm:pr-2">
          <div>
            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl xl:text-[54px] font-semibold tracking-[-0.03em] leading-[1.0] text-white">
              {item.name}
            </h3>

            <p className="mt-3.5 sm:mt-4 font-sans text-sm sm:text-base md:text-lg xl:text-[19px] leading-relaxed text-[#F4F1EA]/80 max-w-2xl">
              {item.summary}
            </p>

            {/* Lista de 3 entregables concretos */}
            <ul className="mt-5 sm:mt-7 space-y-2.5 sm:space-y-3.5 border-t border-white/[0.09] pt-4 sm:pt-6">
              {item.deliverables.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 font-sans text-sm sm:text-base md:text-[17px] leading-snug text-[#F4F1EA]/90"
                >
                  <span
                    className="ellik-deck-orb mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-white/25 bg-white/[0.06]"
                    style={{ color: item.accent }}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botón CTA directo al ContactDrawer + subtítulo en Satoshi */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-4 pr-16 sm:pr-20 lg:pr-0">
            <button
              type="button"
              data-cursor="action"
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className="group/btn relative inline-flex min-h-[48px] sm:min-h-[52px] items-center gap-2.5 overflow-hidden border border-white/30 bg-white/[0.04] px-5 sm:px-7 py-3 font-sans font-medium text-xs sm:text-[13px] uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:border-white"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-y-[102%] bg-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0 group-hover/card:translate-y-0"
              />
              <span className="relative z-10 inline-flex items-center gap-2 transition-colors duration-300 group-hover/btn:text-[#050505] group-hover/card:text-[#050505]">
                <span>{item.ctaLabel}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
              </span>
            </button>

            <span className="hidden sm:inline-block font-sans font-medium text-[11px] sm:text-xs uppercase tracking-[0.14em] text-white/50">
              {item.ctaSublabel}
            </span>
          </div>
        </div>

        {/* Columna derecha: Vista previa amplia de caso real ELLIK (en desktop lg+) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center lg:pr-6 xl:pr-10 min-h-0">
          <div className="ellik-deck-media relative aspect-[16/10] w-full overflow-hidden border border-white/15 bg-[#121217] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 620px, 480px"
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090C]/75 via-transparent to-transparent"
            />
            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
              <span className="font-sans font-medium text-[11px] uppercase tracking-[0.16em] text-[#F4F1EA]/90 bg-[#09090C]/85 px-3 py-1.5 border border-white/15">
                CASO REAL EN PRODUCCIÓN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recorte cóncavo inferior derecho relleno con `ground` (#F4F1EA) + botón circular */}
      <div
        className="ellik-deck-notch absolute bottom-0 right-0 z-20 flex h-[76px] w-[76px] sm:h-[96px] sm:w-[96px] items-end justify-end p-2 sm:p-3"
        style={{ backgroundColor: ground }}
      >
        {/* Filete cóncavo superior sobre el borde derecho */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute -top-6 right-0 h-6 w-6"
        >
          <path
            d="M24 0v24H0C13.255 24 24 13.255 24 0Z"
            fill={ground}
          />
        </svg>

        {/* Filete cóncavo izquierdo sobre el borde inferior */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute bottom-0 -left-6 h-6 w-6"
        >
          <path
            d="M24 0v24H0C13.255 24 24 13.255 24 0Z"
            fill={ground}
          />
        </svg>

        <button
          type="button"
          data-cursor="action"
          aria-label={`${item.ctaLabel} — ${item.name}`}
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
          style={{ backgroundColor: item.accent }}
          className="ellik-deck-orb relative flex h-14 w-14 sm:h-[72px] sm:w-[72px] items-center justify-center text-[#050505] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.22,1.25,0.36,1)] group-hover/card:scale-105 group-hover/card:rotate-12"
        >
          <ArrowUpRight className="h-5 w-5 sm:h-7 sm:w-7 stroke-[2.2]" />
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
    stiffness: 380,
    damping: 48,
    mass: 0.35,
  });

  if (!items.length) return null;

  return (
    <MotionConfig reducedMotion="user">
      <style>{DECK_SCOPED_CSS}</style>
      <div
        ref={containerRef}
        style={{
          height: reducedMotion ? "auto" : `${items.length * 90}svh`,
        }}
        className={cn("relative w-full", className)}
      >
        <div
          className={cn(
            "w-full",
            reducedMotion
              ? "relative"
              : "sticky top-16 sm:top-20 lg:top-[84px] h-[82svh] min-h-[580px] max-h-[780px] flex items-end"
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
