"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MISSIONS, type Mission } from "@/data/ellikData";
import { AnimatedHeading, HairlineRule } from "./AnimatedHeading";

interface FallbackCanvasProps {
  variant?: Mission["fallbackVariant"];
}

/**
 * Respaldo arquitectónico de alto contraste únicamente si falla la carga remota.
 */
function FallbackCanvas({ variant }: FallbackCanvasProps) {
  switch (variant) {
    case "gastro-1":
      return (
        <div
          className="relative h-full w-full overflow-hidden p-6 sm:p-8 flex items-center justify-between gap-6"
          style={{
            background:
              "radial-gradient(circle at 72% 28%, rgba(217, 167, 96, 0.28) 0%, rgba(244, 241, 234, 0.08) 32%, #08080A 74%)",
          }}
        >
          <div className="hidden sm:flex flex-col justify-between h-full w-5/12 py-2">
            <div className="space-y-3">
              <div className="h-2 w-16 bg-[#F4F1EA]/70" />
              <div className="h-7 w-full bg-[#FFFFFF]/90" />
              <div className="h-7 w-4/5 bg-[#FFFFFF]/65" />
            </div>

            <div className="space-y-2.5">
              <div
                className="h-24 w-full border border-white/20"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(217,167,96,0.34) 0%, rgba(244,241,234,0.16) 50%, rgba(12,12,15,0.9) 100%)",
                }}
              />
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-white/30" />
                <span className="font-mono text-xs text-[#F4F1EA]">→</span>
              </div>
            </div>
          </div>

          <div
            className="mx-auto sm:mx-0 w-[160px] sm:w-[200px] h-[92%] sm:h-[88%] overflow-hidden border border-white/35 bg-[#0C0C0F] p-2.5 sm:p-3.5 flex flex-col justify-between shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
            style={{
              transform: "perspective(800px) rotateY(-12deg) rotateZ(-3deg)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-1.5 sm:pb-2 shrink-0">
              <span className="h-1.5 w-10 bg-[#F4F1EA]/80" />
              <span className="h-2 w-2 bg-[#D9A760]/80" />
            </div>

            <div className="space-y-2 sm:space-y-2.5 my-auto py-1.5 min-h-0">
              <div
                className="h-14 sm:h-20 w-full border border-white/20"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(244,241,234,0.42) 0%, rgba(217,167,96,0.28) 55%, #121216 100%)",
                }}
              />
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <div className="h-8 sm:h-12 border border-white/20 bg-white/[0.08]" />
                <div
                  className="h-8 sm:h-12 border border-white/25"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(217,167,96,0.3) 0%, rgba(255,255,255,0.06) 100%)",
                  }}
                />
              </div>
              <div className="space-y-1 sm:space-y-1.5 pt-0.5">
                <span className="block h-1.5 w-full bg-white/25" />
                <span className="block h-1.5 w-2/3 bg-white/15" />
              </div>
            </div>

            <div className="h-6 sm:h-8 w-full shrink-0 bg-[#F4F1EA] flex items-center justify-between px-2.5 sm:px-3">
              <span className="h-1.5 w-14 sm:w-16 bg-[#050505]/85" />
              <span className="h-2 w-2 bg-[#050505]" />
            </div>
          </div>
        </div>
      );

    case "gastro-2":
      return (
        <div
          className="relative h-full w-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between gap-4"
          style={{
            background:
              "radial-gradient(ellipse at 32% 35%, rgba(244, 241, 234, 0.22) 0%, rgba(138, 138, 147, 0.08) 44%, #070709 84%)",
          }}
        >
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
            <div
              className="col-span-7 border border-white/30 p-4 flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(160deg, rgba(244,241,234,0.88) 0%, rgba(214,210,200,0.45) 48%, rgba(18,18,22,0.92) 100%)",
              }}
            >
              <div className="flex justify-between">
                <span className="h-2 w-12 bg-[#050505]/85" />
                <span className="h-3 w-3 border border-[#050505]/70" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-4/5 bg-[#050505]/85" />
                <div className="h-2.5 w-1/2 bg-[#050505]/55" />
              </div>
            </div>

            <div className="col-span-5 grid grid-rows-2 gap-4">
              <div
                className="border border-white/25 p-3 flex flex-col justify-end"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244,241,234,0.28) 0%, rgba(255,255,255,0.06) 100%)",
                }}
              >
                <span className="h-2.5 w-3/4 bg-[#FFFFFF]/80" />
              </div>
              <div className="border border-white/20 bg-white/[0.06] p-3 flex flex-col justify-between">
                <div className="flex gap-2">
                  <span className="h-8 w-8 border border-white/25 bg-white/10" />
                  <div className="flex-1 space-y-1.5 py-1">
                    <span className="block h-2 w-full bg-white/60" />
                    <span className="block h-1.5 w-2/3 bg-white/30" />
                  </div>
                </div>
                <span className="h-1.5 w-1/2 bg-[#F4F1EA]/70" />
              </div>
            </div>
          </div>

          <div className="h-10 w-full border border-white/30 bg-[#0D0D10]/95 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2 w-14 bg-white/75" />
              <span className="h-2 w-8 bg-white/30" />
            </div>
            <div className="h-5 w-20 bg-[#F4F1EA]" />
          </div>
        </div>
      );

    case "ropa":
      return (
        <div
          className="relative h-full w-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(135deg, #111114 0%, #050507 58%, #0E0E11 100%)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-16 bg-[#FFFFFF]/90" />
              <span className="h-2 w-6 bg-white/30" />
            </div>
            <div className="flex gap-1.5">
              <span className="h-3 w-3 border border-white/40" />
              <span className="h-3 w-3 bg-[#FFFFFF]" />
              <span className="h-3 w-3 border border-white/40" />
            </div>
          </div>

          <div className="my-auto grid grid-cols-3 gap-4 sm:gap-5 items-center py-2">
            <div className="aspect-[3/4] border border-white/25 bg-gradient-to-b from-white/75 via-zinc-500/35 to-[#0A0A0D] p-2.5 flex flex-col justify-end">
              <span className="h-1.5 w-3/4 bg-white/80" />
            </div>
            <div className="aspect-[3/4] -translate-y-2 border border-[#FFFFFF]/65 bg-gradient-to-b from-[#FFFFFF] via-zinc-400/50 to-[#0C0C0E] p-2.5 flex flex-col justify-between shadow-[0_18px_40px_rgba(0,0,0,0.85)]">
              <span className="h-2 w-2 bg-[#050505]" />
              <div className="space-y-1">
                <span className="block h-2 w-4/5 bg-white/90" />
                <span className="block h-1.5 w-1/2 bg-white/50" />
              </div>
            </div>
            <div className="aspect-[3/4] border border-white/25 bg-gradient-to-b from-white/60 via-zinc-600/30 to-[#0A0A0D] p-2.5 flex flex-col justify-end">
              <span className="h-1.5 w-2/3 bg-white/75" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/15 pt-2.5">
            <span className="h-1.5 w-24 bg-white/40" />
            <span className="h-1.5 w-10 bg-[#FFFFFF]/80" />
          </div>
        </div>
      );

    default:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,241,234,0.16) 0%, rgba(18,18,22,0.92) 44%, #060608 100%)",
          }}
        >
          <div className="grid grid-cols-12 gap-3 border-b border-white/25 pb-4 items-center">
            <div className="col-span-2 flex items-center gap-2">
              <div className="h-7 w-7 border border-[#FFFFFF]/80 flex items-center justify-center">
                <span className="h-2.5 w-2.5 bg-[#FFFFFF]" />
              </div>
            </div>
            <div className="col-span-7 space-y-1.5">
              <div className="h-4 w-5/6 bg-[#FFFFFF]/92" />
              <div className="h-1.5 w-1/2 bg-white/45" />
            </div>
            <div className="col-span-3 flex justify-end gap-2">
              <span className="h-2 w-8 bg-white/50" />
              <span className="h-2 w-8 bg-white/50" />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-3 py-4">
            <div className="col-span-4 border border-white/25 bg-white/[0.08] p-3 flex flex-col justify-between">
              <span className="h-3 w-3 border border-white/60" />
              <div className="space-y-1.5">
                <span className="block h-2.5 w-full bg-white/85" />
                <span className="block h-1.5 w-3/4 bg-white/40" />
              </div>
            </div>
            <div className="col-span-4 border border-white/30 bg-[#F4F1EA]/15 p-3 flex flex-col justify-between">
              <span className="h-3 w-3 bg-[#F4F1EA]" />
              <div className="space-y-1.5">
                <span className="block h-2.5 w-4/5 bg-[#FFFFFF]" />
                <span className="block h-1.5 w-2/3 bg-white/50" />
              </div>
            </div>
            <div className="col-span-4 border border-white/25 bg-white/[0.08] p-3 flex flex-col justify-between">
              <span className="h-3 w-3 border border-white/60" />
              <div className="space-y-1.5">
                <span className="block h-2.5 w-full bg-white/85" />
                <span className="block h-1.5 w-1/2 bg-white/40" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 border-t border-white/20 pt-3">
            <div className="col-span-6 h-2 w-28 bg-white/45" />
            <div className="col-span-6 flex justify-end gap-2">
              <span className="h-2 w-12 bg-white/30" />
              <span className="h-2 w-12 bg-white/75" />
            </div>
          </div>
        </div>
      );
  }
}

interface ProjectShowcaseRowProps {
  mission: Mission;
  index: number;
}

function ProjectShowcaseRow({ mission, index }: ProjectShowcaseRowProps) {
  const rowRef = useRef<HTMLElement | null>(null);
  const beamRef = useRef<HTMLDivElement | null>(null);
  const finePointerRef = useRef<boolean>(false);

  const [primaryError, setPrimaryError] = useState(false);
  const [secondaryError, setSecondaryError] = useState(false);

  // B1 & B3. Física 3D con puntero fino: tilt ±7deg X / ±9deg Y + desplazamiento inverso ±10px
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const rawSecondaryX = useMotionValue(0);
  const rawSecondaryY = useMotionValue(0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const syncPointer = () => {
      finePointerRef.current = mq.matches;
      if (!mq.matches) {
        rawTiltX.set(0);
        rawTiltY.set(0);
        rawSecondaryX.set(0);
        rawSecondaryY.set(0);
      }
    };
    syncPointer();
    mq.addEventListener("change", syncPointer);
    return () => mq.removeEventListener("change", syncPointer);
  }, [rawTiltX, rawTiltY, rawSecondaryX, rawSecondaryY]);

  const hoverRotateX = useSpring(rawTiltX, { stiffness: 190, damping: 24 });
  const hoverRotateY = useSpring(rawTiltY, { stiffness: 190, damping: 24 });
  const secondaryOffsetX = useSpring(rawSecondaryX, {
    stiffness: 175,
    damping: 22,
  });
  const secondaryOffsetY = useSpring(rawSecondaryY, {
    stiffness: 175,
    damping: 22,
  });

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  // A. Índice Monumental Reactivo al Scroll: #F4F1EA al centro y desplazamiento ±20px en Y
  const indexY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const indexColor = useTransform(
    scrollYProgress,
    [0.18, 0.45, 0.58, 0.85],
    [
      "rgba(255, 255, 255, 0.12)",
      "rgba(244, 241, 234, 1)",
      "rgba(244, 241, 234, 1)",
      "rgba(255, 255, 255, 0.12)",
    ]
  );

  // B2. Parallax vertical ligado al scroll para la capa base (-6% a +6% con scale 1.12)
  const frameParallaxY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!finePointerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const nx = relX / Math.max(rect.width, 1) - 0.5;
    const ny = relY / Math.max(rect.height, 1) - 0.5;

    rawTiltX.set(-ny * 14); // -7deg a +7deg
    rawTiltY.set(nx * 18); // -9deg a +9deg
    rawSecondaryX.set(-nx * 20); // ±10px en sentido opuesto
    rawSecondaryY.set(-ny * 20);

    if (beamRef.current) {
      beamRef.current.style.setProperty("--x", `${relX.toFixed(1)}px`);
      beamRef.current.style.setProperty("--y", `${relY.toFixed(1)}px`);
    }
  };

  const handleStageMouseLeave = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
    rawSecondaryX.set(0);
    rawSecondaryY.set(0);
  };

  return (
    <motion.article
      ref={rowRef}
      id={mission.id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{
        duration: 0.55,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-10 items-start"
    >
      {/* A. Índice monumental reactivo al scroll */}
      <div className="lg:col-span-1 xl:col-span-2 flex items-start pb-2 lg:pb-0">
        <motion.span
          aria-hidden="true"
          style={{
            fontSize: "clamp(3.5rem, 6.5vw, 5.5rem)",
            y: indexY,
            color: indexColor,
          }}
          className="font-serif italic leading-[0.85] tracking-[-0.02em] select-none will-change-transform"
        >
          {mission.index}
        </motion.span>
      </div>

      {/* C. Columna Editorial Limpia */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between h-full">
        <div>
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#71717A]">
            {mission.category} · {mission.location}
          </p>

          <h3 className="mt-5 font-display text-3xl md:text-[42px] font-medium tracking-[-0.025em] leading-[1.04] text-white">
            {mission.title}
          </h3>

          <p className="mt-5 font-sans text-base md:text-[17px] leading-[1.65] text-[#9CA3AF]">
            {mission.description}
          </p>

          <p className="mt-6 border-l-2 border-[#F4F1EA]/40 pl-3 font-sans text-sm leading-snug text-[#F4F1EA]">
            {mission.highlight}
          </p>
        </div>

        <div className="relative mt-9 pt-6">
          <HairlineRule
            delay={0.1}
            className="absolute top-0 left-0 right-0"
          />

          <a
            href={mission.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="action"
            className="group/btn relative inline-flex min-h-[44px] items-center gap-3 overflow-hidden border border-white/25 px-6 py-3.5 font-sans text-xs font-medium tracking-[0.06em] uppercase text-white transition-colors duration-300 hover:border-white"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-white translate-y-[102%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0"
            />
            <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-300 group-hover/btn:text-[#050505] group-focus-visible/btn:text-[#050505]">
              <span>Visitar sitio en vivo</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>

      {/* B. Monolito Visual 3D en Eje Z (preserve-3d, doble capa real sin marco de navegador) */}
      <div
        className="lg:col-span-6 pb-6 md:pb-8 pr-3 md:pr-6 lg:pr-0"
        style={{ perspective: "1200px" }}
      >
        <motion.a
          href={mission.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="view"
          aria-label={`Visitar ${mission.title} en vivo`}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          style={{
            rotateX: hoverRotateX,
            rotateY: hoverRotateY,
            transformStyle: "preserve-3d",
          }}
          className="group/stage relative block will-change-transform focus:outline-none"
        >
          {/* Capa Base (translateZ: 0px): previewImage con parallax de scroll + haz de luz */}
          <div
            style={{ transform: "translateZ(0px)" }}
            className="relative aspect-[16/10] w-full overflow-hidden bg-[#09090B] border border-[rgba(255,255,255,0.16)] transition-colors duration-300 group-hover/stage:border-[rgba(255,255,255,0.38)]"
          >
            <motion.div
              style={{ y: frameParallaxY, scale: 1.12 }}
              className="relative h-full w-full will-change-transform"
            >
              {primaryError ? (
                <FallbackCanvas variant={mission.fallbackVariant} />
              ) : (
                <Image
                  src={mission.previewImage}
                  alt={mission.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={index === 0}
                  draggable={false}
                  onError={() => setPrimaryError(true)}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>

            {/* Viñeta muy sutil para separar la capa flotante frontal */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505]/55 via-transparent to-transparent" />

            {/* Haz de luz estelar siguiendo el cursor */}
            <div
              ref={beamRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/stage:opacity-100"
              style={{
                background:
                  "radial-gradient(500px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.11), transparent 45%)",
              }}
            />
          </div>

          {/* Capa Flotante Despegada (translateZ: 55px): secondaryImage desplazada en sentido opuesto */}
          {!secondaryError && (
            <div
              style={{
                transform: "translateZ(55px)",
                transformStyle: "preserve-3d",
              }}
              className="absolute -bottom-5 -right-3 md:-bottom-7 md:-right-6 z-20"
            >
              <motion.div
                style={{
                  x: secondaryOffsetX,
                  y: secondaryOffsetY,
                }}
                className="w-32 sm:w-40 md:w-48 aspect-[4/3] border border-[rgba(255,255,255,0.28)] bg-[#050505] shadow-[0_25px_50px_rgba(0,0,0,0.9)] overflow-hidden will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stage:scale-[1.03]"
              >
                <Image
                  src={mission.secondaryImage}
                  alt={`${mission.shortTitle} — Vista secundaria`}
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 192px"
                  draggable={false}
                  onError={() => setSecondaryError(true)}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          )}
        </motion.a>
      </div>

      <HairlineRule
        delay={0.14}
        className="absolute bottom-0 left-0 right-0"
      />
    </motion.article>
  );
}

export function MissionsSection() {
  return (
    <section id="proyectos" className="relative py-24 lg:py-36">
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div>
        <AnimatedHeading
          prefix="Desarrollos reales probando"
          accent="resultados en producción."
          toneVariant="silver"
          className="text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.025em] max-w-4xl"
        />

        <div className="relative mt-16">
          <HairlineRule delay={0.12} />

          {MISSIONS.map((mission, idx) => (
            <ProjectShowcaseRow
              key={mission.id}
              mission={mission}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
