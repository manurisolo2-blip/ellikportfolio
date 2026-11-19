"use client";

import React, { useRef, type ReactNode } from "react";
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
  children?: ReactNode;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const ENTER = 0.72;

/**
 * Progreso de llegada [0..1] de la tarjeta `j` dentro del mazo en `v`.
 */
function arrived(j: number, v: number, count: number): number {
  if (j <= 0) return 1;
  const span = Math.max(1, count - 1);
  return easeOut(clamp01((v * span - (j - 1)) / ENTER));
}

const DECK_SCOPED_CSS = `
.ellik-deck-card {
  border-radius: 24px !important;
}
.ellik-deck-media {
  border-radius: 16px !important;
}
.ellik-deck-notch {
  border-top-left-radius: 20px !important;
}
.ellik-deck-orb {
  border-radius: 9999px !important;
}
`;

interface DeckCardProps {
  item: DeckItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  still: boolean;
  ground: string;
  onSelectItem?: (item: DeckItem) => void;
}

function CutoutAction({
  item,
  ground,
  onAction,
}: {
  item: DeckItem;
  ground: string;
  onAction: () => void;
}) {
  const R = 18;
  const corner = (
    <svg
      aria-hidden="true"
      width={R}
      height={R}
      viewBox={`0 0 ${R} ${R}`}
      className="block"
    >
      <path d={`M${R} 0 V${R} H0 A${R} ${R} 0 0 0 ${R} 0 Z`} fill={ground} />
    </svg>
  );

  return (
    <div className="absolute right-0 bottom-0 z-20">
      <div className="pointer-events-none absolute right-0 bottom-full">
        {corner}
      </div>
      <div className="pointer-events-none absolute right-full bottom-0">
        {corner}
      </div>
      <button
        type="button"
        data-deck-cta={item.id}
        data-cursor="action"
        aria-label={`${item.ctaLabel} — ${item.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        className="ellik-deck-notch group/cta flex items-center gap-4 py-3 pr-2.5 pl-5 text-[#111318] outline-none sm:gap-5 sm:py-4 sm:pr-3 sm:pl-7 text-left"
        style={{ background: ground }}
      >
        <span className="flex flex-col leading-tight">
          <span className="font-display font-semibold text-[#050505] text-[15px] sm:text-[17px] leading-tight whitespace-nowrap">
            {item.ctaLabel}
          </span>
          <span className="font-sans text-[#52525B] text-[12px] sm:text-[13px] leading-snug whitespace-nowrap">
            {item.ctaSublabel}
          </span>
        </span>

        <span
          className="ellik-deck-orb grid size-11 sm:size-[52px] shrink-0 place-items-center text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out group-hover/card:rotate-45 group-hover/cta:rotate-45 group-active/cta:scale-90 group-focus-visible/cta:outline-2 group-focus-visible/cta:outline-offset-2"
          style={{ backgroundColor: item.accent, outlineColor: item.accent }}
        >
          <ArrowUpRight className="size-5 sm:size-6" strokeWidth={2.2} />
        </span>
      </button>
    </div>
  );
}

function DeckCard({
  item,
  index,
  count,
  progress,
  still,
  ground,
  onSelectItem,
}: DeckCardProps) {
  const above = (v: number): number => {
    let n = 0;
    for (let j = index + 1; j < count; j++) {
      n += arrived(j, v, count);
    }
    return Math.min(3, n);
  };

  const y = useTransform(
    progress,
    (v) =>
      `${((1 - arrived(index, v, count)) * 108 - above(v) * 5).toFixed(3)}svh`
  );
  const rotateX = useTransform(
    progress,
    (v) => -(1 - arrived(index, v, count)) * 30 + above(v) * 5
  );
  const scale = useTransform(
    progress,
    (v) => 0.9 + 0.1 * arrived(index, v, count) - above(v) * 0.05
  );
  const filter = useTransform(
    progress,
    (v) =>
      `blur(${((1 - arrived(index, v, count)) ** 2 * 12 + above(v) * 1.1).toFixed(2)}px)`
  );
  const dim = useTransform(progress, (v) => above(v) * 0.15);
  const stillY = useTransform(progress, (v) =>
    arrived(index, v, count) >= 0.5 ? "0svh" : "110svh"
  );

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
      aria-label={`${item.name}: ${item.summary}`}
      className="col-start-1 row-start-1 mt-[4svh] w-[min(100%,calc(76svh*16/9),1100px)] origin-[50%_25%] will-change-[transform,filter] max-sm:w-full"
      style={{
        zIndex: index + 1,
        transformOrigin: "50% 25%",
        ...(still ? { y: stillY } : { y, rotateX, scale, filter }),
      }}
    >
      <div
        data-cursor="action"
        onClick={handleAction}
        className="ellik-deck-card group/card relative flex flex-col w-full overflow-hidden cursor-pointer select-none bg-[#09090C] text-[#F4F1EA] border border-white/[0.14] shadow-[0_50px_90px_-35px_rgba(10,12,20,0.5)] lg:aspect-[16/9] min-h-[450px] sm:min-h-[480px] lg:min-h-0"
      >
        {/* Cuerpo principal de la tarjeta */}
        <div className="relative z-[5] flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 px-6 sm:px-9 lg:px-11 pt-7 sm:pt-9 lg:pt-11 pb-24 sm:pb-24 lg:pb-14">
          {/* Columna izquierda: Título, Resumen y 3 entregables */}
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

          {/* Columna derecha: Captura limpia de producción */}
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

        {/* Oscurecimiento progresivo por debajo de la muesca para preservar el ground */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[#0A0C14]"
          style={{ opacity: still ? 0 : dim }}
        />

        {/* Único CTA en la esquina inferior derecha troquelada (R=18) */}
        <CutoutAction item={item} ground={ground} onAction={handleAction} />
      </div>
    </motion.article>
  );
}

export function ProjectDeck({
  items,
  ground = "#F4F1EA",
  onSelectItem,
  className,
  children,
}: ProjectDeckProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const still = useReducedMotion() ?? false;
  const count = items.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 380,
    damping: 48,
    mass: 0.35,
  });

  if (!count) return null;

  return (
    <MotionConfig reducedMotion="user">
      <style>{DECK_SCOPED_CSS}</style>
      <div
        ref={containerRef}
        className={cn("relative w-full", className)}
        style={{ height: `${Math.max(1, count) * 100}svh` }}
        aria-label="Modalidades de servicio"
      >
        <div
          className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden px-5 sm:px-10 lg:px-28 xl:px-32"
          style={{ perspective: "1800px" }}
        >
          {items.map((item, idx) => (
            <DeckCard
              key={item.id}
              item={item}
              index={idx}
              count={count}
              progress={progress}
              still={still}
              ground={ground}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      </div>
      {children}
    </MotionConfig>
  );
}

export default ProjectDeck;
