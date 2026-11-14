"use client";

import React, { useEffect, useRef, useState } from "react";
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

function useProbedImage(src: string): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const probe = new window.Image();
    probe.onload = () => {
      if (active) setLoaded(true);
    };
    probe.onerror = () => {
      if (active) setLoaded(false);
    };
    probe.src = src;

    return () => {
      active = false;
    };
  }, [src]);

  return loaded;
}

interface HighEndProjectCanvasProps {
  mission: Mission;
}

/**
 * Muestra la captura real si existe en public/proyectos/; de lo contrario,
 * renderiza un lienzo arquitectónico específico de alto contraste sin texto de relleno.
 */
function HighEndProjectCanvas({ mission }: HighEndProjectCanvasProps) {
  const hasRealImage = useProbedImage(mission.previewImage);

  if (hasRealImage) {
    return (
      <div
        role="img"
        aria-label={mission.title}
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${mission.previewImage})` }}
      />
    );
  }

  switch (mission.fallbackVariant) {
    case "gastro-1":
      return (
        <div
          className="relative h-full w-full overflow-hidden p-6 sm:p-8 flex items-center justify-between gap-6"
          style={{
            background:
              "radial-gradient(circle at 72% 28%, rgba(217, 167, 96, 0.28) 0%, rgba(244, 241, 234, 0.08) 32%, #08080A 74%)",
          }}
        >
          {/* Fondo arquitectónico de retícula y foco cálido */}
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

          {/* Silueta de teléfono móvil en perspectiva con flujo de pedido */}
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

            {/* Botón de confirmación luminoso */}
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
          {/* Grilla editorial asimétrica de doble columna */}
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

          {/* Barra flotante minimalista inferior */}
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
          {/* Retícula superior minimalista */}
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

          {/* Lookbook monocromático en proporción vertical 3:4 */}
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
          {/* Arquitectura limpia de grilla suiza institucional */}
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
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });

  // Índice monumental: se ilumina en #F4F1EA y se desplaza en Y al centrar en pantalla
  const indexY = useTransform(scrollYProgress, [0, 1], [28, -28]);
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

  // Scroll Parallax interno dentro de la ventana 16:10 (-8% a +8%)
  const frameParallaxY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // Hover 3D hacia el puntero (±4deg)
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const hoverRotateX = useSpring(rawTiltX, { stiffness: 180, damping: 22 });
  const hoverRotateY = useSpring(rawTiltY, { stiffness: 180, damping: 22 });

  const handleFrameMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    rawTiltX.set(-ny * 8); // +4deg arriba a -4deg abajo
    rawTiltY.set(nx * 8); // -4deg izquierda a +4deg derecha
  };

  const handleFrameMouseEnter = () => {
    setIsHovered(true);
  };

  const handleFrameMouseLeave = () => {
    setIsHovered(false);
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const formattedNumber = String(index + 1).padStart(2, "0");

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
      className="relative py-16 lg:py-24 grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start"
    >
      {/* Índice tipográfico monumental a la izquierda */}
      <div className="xl:col-span-2 flex items-start pb-4 xl:pb-0">
        <motion.span
          aria-hidden="true"
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            y: indexY,
            color: indexColor,
          }}
          className="font-serif italic leading-[0.85] tracking-[-0.02em] select-none will-change-transform"
        >
          {formattedNumber}
        </motion.span>
      </div>

      {/* Columna de información comercial */}
      <div className="xl:col-span-4 flex flex-col justify-between h-full">
        <div>
          <p className="section-label">{mission.category}</p>

          <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold uppercase tracking-[-0.02em] leading-[1.05] text-[var(--text-primary)]">
            {mission.title}
          </h3>

          <p className="editorial-body mt-5 text-[var(--text-secondary)]">
            {mission.problemSolved}
          </p>

          <p className="mt-7 font-mono text-[11px] tracking-[0.18em] uppercase text-[#71717A]">
            {mission.metric}
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
            className="group inline-flex items-center gap-3 border border-[rgba(255,255,255,0.25)] px-6 py-3.5 font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--text-primary)] hover:text-[#050505] hover:border-[var(--text-primary)]"
          >
            <span>PROBAR PÁGINA EN VIVO</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* Columna derecha: Escaparate interactivo 16:10 con Parallax + Hover 3D (±4deg) + Zoom 1.04 */}
      <div className="xl:col-span-6" style={{ perspective: "1100px" }}>
        <motion.a
          href={mission.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="view"
          aria-label={`Ver ${mission.title}`}
          onMouseMove={handleFrameMouseMove}
          onMouseEnter={handleFrameMouseEnter}
          onMouseLeave={handleFrameMouseLeave}
          style={{
            rotateX: hoverRotateX,
            rotateY: hoverRotateY,
            transformStyle: "preserve-3d",
          }}
          className={`group block border bg-[var(--bg-elevated)] transition-colors duration-300 will-change-transform ${
            isHovered
              ? "border-[#FFFFFF] shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
              : "border-[var(--border-hairline)]"
          }`}
        >
          <div className="relative flex items-center justify-between px-4 py-2.5 bg-[#08080A]">
            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] truncate">
              https://{mission.domainDisplay}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)] shrink-0" />
            <HairlineRule
              delay={0.12}
              className="absolute bottom-0 left-0 right-0"
            />
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <motion.div
              style={{ y: frameParallaxY }}
              className="relative -top-[12%] h-[124%] w-full will-change-transform"
            >
              <motion.div
                animate={{ scale: isHovered ? 1.04 : 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full will-change-transform"
              >
                <HighEndProjectCanvas mission={mission} />
              </motion.div>
            </motion.div>
          </div>
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
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="section-label"
        >
          PROYECTOS
        </motion.p>

        <AnimatedHeading
          prefix="DESARROLLOS REALES PROBANDO RESULTADOS EN"
          accent="PRODUCCIÓN."
          className="heading-section mt-6 max-w-4xl text-[var(--text-primary)]"
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
