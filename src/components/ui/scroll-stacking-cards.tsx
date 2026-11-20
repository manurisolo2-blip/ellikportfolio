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
  deliverables: string[];// 3 puntos concretos incluidos
  image: string;         // Captura real local de respaldo visual (/previews/...)
  accent: string;        // Color de acento del círculo con flecha
  ctaLabel: string;      // Ej: "Consultar esta modalidad"
  ctaSublabel: string;   // Ej: "Charla directa por WhatsApp"
  exampleLabel: string;  // Ej: "mojo-grille-demo.vercel.app"
  estimatedTime: string; // Ej: "5 a 7 días"
  focus: string;         // Ej: "Mobile-first + WhatsApp"
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
  border-top-left-radius: 18px !important;
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
          <span className="font-display font-semibold text-[#050505] text-[16px] sm:text-[18px] tracking-[0em] [word-spacing:0.04em] leading-tight whitespace-nowrap">
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

  // Contra-parallax sutil en la captura al aterrizar la tarjeta
  const imgScale = useTransform(progress, (v) =>
    still ? 1 : 1.08 - 0.08 * arrived(index, v, count)
  );
  const imgY = useTransform(progress, (v) =>
    still ? 0 : (1 - arrived(index, v, count)) * 16
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
        className="ellik-deck-card group/card relative grid w-full grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-12 lg:grid-rows-1 h-[555px] sm:h-[570px] lg:h-[min(68svh,560px)] overflow-hidden cursor-pointer select-none bg-[#09090C] text-[#F4F1EA] border border-white/[0.12] border-t-white/[0.16] shadow-[0_50px_90px_-35px_rgba(10,12,20,0.5)]"
      >
        {/* Lomo superior clickable cuando la tarjeta está apilada detrás */}
        <motion.button
          type="button"
          data-deck-spine={item.id}
          data-cursor="action"
          aria-label={`Volver a la tarjeta ${item.index}: ${item.name}`}
          style={{
            opacity: spineOpacity,
            pointerEvents: spinePointerEvents,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onJumpToCard(index);
          }}
          className="absolute inset-x-0 top-0 z-30 h-[36px] px-5 sm:px-9 lg:px-11 flex items-center justify-between bg-[#09090C]/95 border-b border-white/[0.08] text-left transition-colors hover:bg-[#121218] outline-none"
        >
          <span className="font-sans font-medium text-[11px] tracking-[0.06em] text-white/75 truncate">
            {item.index} · {item.name}
          </span>
          <span className="font-sans font-medium text-[10px] uppercase tracking-[0.16em] text-white/45 shrink-0 ml-4">
            VER ↑
          </span>
        </motion.button>

        {/* Columna izquierda: Cabecera respirable, lista editorial numerada y bloque comercial */}
        <div className="relative z-[5] lg:col-span-6 p-5 sm:p-9 lg:p-9 xl:p-12 flex flex-col justify-between min-w-0">
          <div>
            <p className="font-sans font-medium text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-white/45 mb-2 sm:mb-3 xl:mb-4">
              {item.index} — {item.eyebrow}
            </p>
            <h3 className="font-display font-medium text-[26px] sm:text-4xl lg:text-[42px] leading-[1.06] tracking-[-0.01em] [word-spacing:0.06em] text-white">
              {item.name}
            </h3>
            <p className="font-sans text-[13px] sm:text-[15px] md:text-base text-[#A1A1AA] leading-relaxed mt-2 sm:mt-3 xl:mt-4 max-w-md">
              {item.summary}
            </p>
          </div>

          <ul className="my-3 sm:my-4 lg:my-2 xl:my-3">
            {item.deliverables.map((point, idx) => (
              <li
                key={idx}
                className="flex items-baseline gap-3 sm:gap-4 py-2 sm:py-2.5 xl:py-3 border-t border-white/[0.08] last:border-b"
              >
                <span className="font-sans text-[11px] tabular-nums text-white/35 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-xs sm:text-sm text-[#E4E4E7] leading-snug">
                  {point}
                </span>
              </li>
            ))}
          </ul>

          <div
            data-deck-metrics={item.id}
            className="pt-1 sm:pt-2 flex items-center gap-5 sm:gap-6"
          >
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-white/40">
                TIEMPO ESTIMADO
              </p>
              <p className="font-sans font-medium text-[12px] sm:text-[13px] text-white/85 mt-0.5">
                {item.estimatedTime}
              </p>
            </div>
            <div className="h-6 w-px bg-white/10 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-white/40">
                ENFOQUE
              </p>
              <p className="font-sans font-medium text-[12px] sm:text-[13px] text-white/85 mt-0.5">
                {item.focus}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Ejemplo real + captura sangrada con contra-parallax */}
        <div className="relative z-[5] lg:col-span-6 flex flex-col justify-between pt-3.5 pl-5 sm:pt-6 sm:pl-8 lg:pt-10 lg:pl-8 overflow-hidden border-t border-white/[0.07] lg:border-t-0 lg:border-l lg:border-white/[0.07] min-h-[145px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 opacity-[0.14]"
            style={{
              background: `radial-gradient(circle, ${item.accent} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-[2] flex items-center justify-between gap-4 pr-5 sm:pr-8 pb-2 sm:pb-3">
            <span className="font-sans font-medium text-[10px] uppercase tracking-[0.16em] text-white/45 shrink-0">
              EJEMPLO REAL
            </span>
            <span className="font-sans text-[11px] text-white/55 truncate">
              {item.exampleLabel}
            </span>
          </div>

          <div className="ellik-deck-media relative z-[2] flex-1 min-h-[105px] lg:min-h-0 w-full overflow-hidden border-t border-l border-white/15 bg-[#121217] shadow-[-16px_-12px_40px_rgba(0,0,0,0.45)]">
            <motion.div
              className="relative h-full w-full will-change-transform"
              style={still ? undefined : { scale: imgScale, y: imgY }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 45vw, 90vw"
                className="h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03]"
              />
            </motion.div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
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
        aria-label="Modalidades de servicio"
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
