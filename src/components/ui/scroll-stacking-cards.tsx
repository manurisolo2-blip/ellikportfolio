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
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeckItem = {
  id: string;
  index: string;         // "01", "02", "03"
  name: string;          // Título de la modalidad
  eyebrow: string;       // Subtítulo corto en Satoshi
  summary: string;       // Descripción humana clara
  deliverables: string[];// 3 puntos clave incluidos
  image: string;         // Captura real local (/previews/...)
  surfaceBg: string;     // Superficie mate sólida diferenciada
  ctaLabel: string;      // Ej: "Consultar esta modalidad"
  ctaSublabel: string;   // Ej: "Charla directa por WhatsApp"
  estimatedTime: string; // Ej: "5 a 7 días"
  focus: string;         // Ej: "Mobile-first + WhatsApp"
  planKey: string;       // Clave para preseleccionar en ContactDrawer
  url?: string;          // Opcional si se usa con link externo
};

export interface DeckLabels {
  estimatedTime: string;
  focus: string;
  viewSpine: string;
  backToCard: (index: string, name: string) => string;
  deckAriaLabel: string;
}

const DEFAULT_DECK_LABELS: DeckLabels = {
  estimatedTime: "TIEMPO ESTIMADO",
  focus: "ENFOQUE",
  viewSpine: "VER ↑",
  backToCard: (index, name) => `Volver a la tarjeta ${index}: ${name}`,
  deckAriaLabel: "Modalidades de servicio",
};

export interface ProjectDeckProps {
  items: DeckItem[];
  ground?: string;
  labels?: DeckLabels;
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
  border-radius: 14px !important;
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
  labels: DeckLabels;
  onSelectItem?: (item: DeckItem) => void;
  onJumpToCard: (index: number) => void;
}

function ActionNotch({
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
          <span className="font-display font-semibold text-[#050505] text-[16.5px] sm:text-[19px] tracking-[-0.01em] [word-spacing:0.04em] leading-tight whitespace-nowrap">
            {item.ctaLabel}
          </span>
          <span className="font-sans font-medium text-[#3F3F46] text-[12px] sm:text-[13px] leading-snug whitespace-nowrap">
            {item.ctaSublabel}
          </span>
        </span>

        <span className="ellik-deck-orb grid size-11 sm:size-[52px] shrink-0 place-items-center bg-[#0B0B0D] text-[#F4F1EA] transition-all duration-200 ease-out group-hover/card:rotate-45 group-hover/cta:rotate-45 group-hover/cta:bg-[#1E1E24] group-active/cta:scale-90 group-focus-visible/cta:outline-2 group-focus-visible/cta:outline-offset-2 group-focus-visible/cta:outline-[#0B0B0D]">
          <ArrowUpRight className="size-5 sm:size-6" strokeWidth={2} />
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
  labels,
  onSelectItem,
  onJumpToCard,
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
  const dim = useTransform(progress, (v) => above(v) * 0.15);
  const stillY = useTransform(progress, (v) =>
    arrived(index, v, count) >= 0.5 ? "0svh" : "110svh"
  );

  // Contra-parallax sutil en la captura al aterrizar la tarjeta (llega exacto a 1x)
  const imgScale = useTransform(progress, (v) =>
    still ? 1 : 1.04 - 0.04 * arrived(index, v, count)
  );
  const imgY = useTransform(progress, (v) =>
    still ? 0 : (1 - arrived(index, v, count)) * 12
  );

  // Lomo clickable visible solo cuando otra tarjeta cubre a ésta por delante
  const spineOpacity = useTransform(progress, (v) =>
    still ? 0 : clamp01((above(v) - 0.18) / 0.45)
  );
  const spinePointerEvents = useTransform(progress, (v) =>
    !still && above(v) > 0.35 ? "auto" : "none"
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

  const paddedCount = String(count).padStart(2, "0");

  return (
    <motion.article
      data-deck-card={index}
      aria-label={`${item.name}: ${item.summary}`}
      className="col-start-1 row-start-1 mt-[2svh] lg:mt-[4svh] w-full max-w-[1100px] origin-[50%_25%] will-change-transform"
      style={{
        zIndex: index + 1,
        transformOrigin: "50% 25%",
        ...(still ? { y: stillY } : { y, rotateX, scale }),
      }}
    >
      <div
        data-cursor="action"
        onClick={handleAction}
        className="ellik-deck-card group/card relative grid w-full grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-12 lg:grid-rows-1 h-[555px] sm:h-[570px] lg:h-[min(68svh,560px)] overflow-hidden cursor-pointer select-none text-[#F4F1EA] border border-white/[0.15] border-t-white/[0.24] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]"
        style={{ backgroundColor: item.surfaceBg }}
      >
        {/* Lomo superior clickable cuando la tarjeta está apilada detrás */}
        <motion.button
          type="button"
          data-deck-spine={item.id}
          data-cursor="action"
          aria-label={labels.backToCard(item.index, item.name)}
          style={{
            opacity: spineOpacity,
            pointerEvents: spinePointerEvents,
            backgroundColor: item.surfaceBg,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onJumpToCard(index);
          }}
          className="absolute inset-x-0 top-0 z-30 h-[36px] px-5 sm:px-9 lg:px-12 flex items-center justify-between border-b border-white/[0.12] text-left transition-colors hover:bg-white/[0.04] outline-none"
        >
          <span className="flex items-baseline gap-2 min-w-0 truncate">
            <span className="font-display font-medium text-[13px] sm:text-[14.5px] tracking-[-0.01em] text-[#F4F1EA] shrink-0">
              {item.index}
            </span>
            <span className="font-sans text-[11px] text-white/45 shrink-0">
              / {paddedCount}
            </span>
            <span aria-hidden="true" className="text-white/25 shrink-0">
              —
            </span>
            <span className="font-display font-medium text-[13px] sm:text-[14.5px] tracking-[-0.01em] text-[#F4F1EA] truncate">
              {item.name}
            </span>
          </span>
          <span className="font-sans font-semibold text-[10.5px] uppercase tracking-[0.16em] text-[#F4F1EA]/80 shrink-0 ml-4">
            {labels.viewSpine}
          </span>
        </motion.button>

        {/* Columna izquierda (5/12): Lámina editorial mate sin cajas ni divisores internos */}
        <div className="relative z-[5] lg:col-span-5 p-4 sm:p-7 lg:p-7 xl:p-9 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display font-semibold text-[22px] sm:text-[28px] xl:text-[30px] leading-none tracking-[-0.02em] text-[#F4F1EA] shrink-0">
              {item.index}
            </span>
            <span className="font-sans font-medium text-[11px] text-white/35 shrink-0">
              / {paddedCount}
            </span>
            <span aria-hidden="true" className="h-3.5 w-px bg-white/[0.18] shrink-0" />
            <p className="font-sans font-semibold text-[10.5px] sm:text-[11px] uppercase tracking-[0.16em] text-[#F4F1EA]/75 truncate">
              {item.eyebrow}
            </p>
          </div>

          <div className="my-2 sm:my-0">
            <h3 className="font-display font-semibold text-[26px] sm:text-[38px] lg:text-[38px] xl:text-[45px] leading-[0.98] tracking-[-0.022em] [word-spacing:0.04em] text-white">
              {item.name}
            </h3>

            <p className="font-sans text-[13px] sm:text-[14.5px] lg:text-[14px] xl:text-[15.5px] text-[#D4D4D8] leading-[1.42] mt-2 sm:mt-3 max-w-[40ch]">
              {item.summary}
            </p>

            <ul className="mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-white/[0.1] flex flex-col gap-1.5 sm:gap-2">
              {item.deliverables.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 font-sans font-medium text-[12.5px] sm:text-[13.5px] lg:text-[13px] xl:text-[14px] leading-snug text-[#F4F1EA]/95"
                >
                  <span
                    aria-hidden="true"
                    className="w-3.5 h-[1.5px] bg-[#F4F1EA]/60 shrink-0 mt-[0.58em]"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-deck-metrics={item.id}
            className="pt-2.5 sm:pt-3.5 border-t border-white/[0.12] flex items-center gap-5 sm:gap-7"
          >
            <div>
              <p className="font-sans font-medium text-[10px] uppercase tracking-[0.16em] text-white/45">
                {labels.estimatedTime}
              </p>
              <p className="font-display font-medium text-[15px] sm:text-[18px] lg:text-[17px] xl:text-[20px] leading-tight tracking-[-0.01em] text-[#F4F1EA] mt-0.5">
                {item.estimatedTime}
              </p>
            </div>
            <span aria-hidden="true" className="h-7 w-px bg-white/[0.12] shrink-0" />
            <div>
              <p className="font-sans font-medium text-[10px] uppercase tracking-[0.16em] text-white/45">
                {labels.focus}
              </p>
              <p className="font-display font-medium text-[15px] sm:text-[18px] lg:text-[17px] xl:text-[20px] leading-tight tracking-[-0.01em] text-[#F4F1EA] mt-0.5">
                {item.focus}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha (7/12): Encuadre completo 16:10 sin recortes laterales */}
        <div className="relative z-[5] lg:col-span-7 px-4 pt-0.5 pb-4 sm:p-6 lg:p-6 lg:pl-2 lg:pb-14 xl:p-7 xl:pl-2 xl:pb-16 flex items-start sm:items-center min-h-0">
          <div className="ellik-deck-media relative w-full aspect-[16/10] overflow-hidden border border-white/[0.16] bg-[#050505] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
            <motion.div
              className="relative h-full w-full will-change-transform"
              style={still ? undefined : { scale: imgScale, y: imgY }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(min-width: 1280px) 620px, (min-width: 1024px) 56vw, 92vw"
                className="h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.02]"
              />
            </motion.div>

            {/* Sutil oscurecimiento únicamente en esquina inferior derecha donde apoya el ActionNotch */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.36) 0%, transparent 45%)",
              }}
            />
          </div>
        </div>

        {/* Oscurecimiento progresivo por debajo de la muesca y del lomo */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[#0A0C14]"
          style={{ opacity: still ? 0 : dim }}
        />

        {/* Único CTA en la esquina inferior derecha troquelada (R=18) */}
        <ActionNotch item={item} ground={ground} onAction={handleAction} />
      </div>
    </motion.article>
  );
}

export function ProjectDeck({
  items,
  ground = "#F4F1EA",
  labels = DEFAULT_DECK_LABELS,
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

  const handleScrollToCard = (targetIdx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const maxScroll = Math.max(0, el.offsetHeight - window.innerHeight);
    const targetV =
      targetIdx === 0
        ? 0
        : Math.min(
            1,
            (targetIdx - 1 + ENTER + 0.14) / Math.max(1, count - 1)
          );
    const targetY = containerTop + maxScroll * targetV;
    const win = window as Window & {
      __ellikLenis?: {
        scrollTo: (target: number, opts?: { duration?: number }) => void;
      };
    };
    if (win.__ellikLenis) {
      win.__ellikLenis.scrollTo(targetY, { duration: 0.9 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  if (!count) return null;

  return (
    <MotionConfig reducedMotion="user">
      <style>{DECK_SCOPED_CSS}</style>
      <div
        ref={containerRef}
        className={cn("relative w-full", className)}
        style={{ height: `${Math.max(1, count) * 100}svh` }}
        aria-label={labels.deckAriaLabel}
      >
        <div
          className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden px-4 pt-16 pb-20 sm:pl-28 sm:pr-8 lg:px-32 lg:py-0 xl:px-36"
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
              labels={labels}
              onSelectItem={onSelectItem}
              onJumpToCard={handleScrollToCard}
            />
          ))}
        </div>
      </div>
      {children}
    </MotionConfig>
  );
}

export default ProjectDeck;
