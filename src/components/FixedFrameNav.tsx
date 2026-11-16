"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { NAV_SECTIONS, type BusinessCategory } from "@/data/ellikData";
import { MagneticButton } from "./AnimatedHeading";
import { EllikLogo } from "./EllikLogo";

const TOTAL_MERIDIAN_TICKS = 49;
const MERIDIAN_TICKS = Array.from({ length: TOTAL_MERIDIAN_TICKS }, (_, i) => i);

interface FixedFrameNavProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function FixedFrameNav({ onOpenDrawer }: FixedFrameNavProps) {
  const [activeId, setActiveId] = useState<string>(NAV_SECTIONS[0].id);
  const [litTickCount, setLitTickCount] = useState<number>(0);

  const { scrollYProgress } = useScroll();
  const meridianPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const updateActiveByPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.scrollY < 80) {
      setActiveId(NAV_SECTIONS[0].id);
      return;
    }

    const triggerY = window.innerHeight * 0.38;
    let currentId = NAV_SECTIONS[0].id;

    for (const section of NAV_SECTIONS) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerY) {
        currentId = section.id;
      }
    }

    setActiveId((prev) => (prev === currentId ? prev : currentId));
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    const nextLit = Math.round(clamped * (TOTAL_MERIDIAN_TICKS - 1));
    setLitTickCount((prev) => (prev === nextLit ? prev : nextLit));
    updateActiveByPosition();
  });

  useEffect(() => {
    const sectionElements = NAV_SECTIONS.map((s) =>
      document.getElementById(s.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      () => {
        updateActiveByPosition();
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", updateActiveByPosition, { passive: true });
    window.addEventListener("resize", updateActiveByPosition, { passive: true });
    updateActiveByPosition();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateActiveByPosition);
      window.removeEventListener("resize", updateActiveByPosition);
    };
  }, [updateActiveByPosition]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeSection =
    NAV_SECTIONS.find((s) => s.id === activeId) ?? NAV_SECTIONS[0];

  return (
    <>
      {/* Esquina Superior Izquierda: Logo ELLIK */}
      <a
        href="#inicio"
        data-cursor="action"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("inicio");
        }}
        aria-label="ELLIK — Volver al inicio"
        className="fixed top-6 left-6 lg:top-8 lg:left-10 z-40 text-[var(--text-primary)] transition-opacity hover:opacity-80"
      >
        <EllikLogo />
      </a>

      {/* Esquina Superior Derecha: Acción magnética de contacto directo */}
      <div className="fixed top-6 right-6 lg:top-8 lg:right-10 z-40">
        <MagneticButton
          onClick={() => onOpenDrawer()}
          className="border border-[rgba(255,255,255,0.20)] bg-[#050505] px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:border-[#FFFFFF]"
        >
          INICIAR CONTACTO ↗
        </MagneticButton>
      </div>

      {/* Hilo Conductor de Meridiano Celeste con escala milimétrica de telescopio (Desktop >= 1024px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-5 top-24 bottom-10 z-40 hidden lg:block w-3 select-none"
      >
        {/* Línea vertical base del meridiano */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.08]" />

        {/* Hilo iluminado progresivo vinculado al scroll */}
        <motion.div
          style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#F4F1EA]/50 via-white/75 to-white shadow-[0_0_8px_rgba(244,241,234,0.35)] will-change-transform"
        />

        {/* Escala de marcas milimétricas de telescopio */}
        <div className="relative flex h-full flex-col justify-between">
          {MERIDIAN_TICKS.map((tick) => {
            const isMajor = tick % 8 === 0;
            const isMid = !isMajor && tick % 4 === 0;
            const isLit = tick <= litTickCount;

            const widthClass = isMajor
              ? "w-2.5"
              : isMid
                ? "w-1.5"
                : "w-[3px]";

            const toneClass = isLit
              ? isMajor
                ? "bg-[#F4F1EA] shadow-[0_0_6px_rgba(244,241,234,0.65)]"
                : "bg-white/70"
              : isMajor
                ? "bg-white/25"
                : "bg-white/[0.12]";

            return (
              <span
                key={tick}
                className={`block h-px transition-[background-color,box-shadow] duration-300 ${widthClass} ${toneClass}`}
              />
            );
          })}
        </div>

        {/* Marcador focal deslizante en la posición exacta del meridiano */}
        <motion.div
          style={{ top: meridianPercent }}
          className="absolute left-[-2px] flex -translate-y-1/2 items-center"
        >
          <span className="h-[5px] w-[5px] border border-white/90 bg-[#F4F1EA] shadow-[0_0_10px_rgba(244,241,234,0.85)]" />
          <span className="h-px w-3 bg-gradient-to-r from-[#F4F1EA] to-transparent" />
        </motion.div>
      </div>

      {/* Índice Lateral Izquierdo con Scroll-Spy integrado al meridiano (Desktop >= 1024px) */}
      <nav
        aria-label="Índice de secciones"
        className="fixed left-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4"
      >
        {NAV_SECTIONS.map((section) => {
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="group flex items-center gap-3 text-left focus:outline-none py-0.5"
            >
              <span
                className={`block h-px transition-all duration-200 ${
                  isActive
                    ? "w-4 bg-[var(--text-primary)]"
                    : "w-2 bg-[var(--text-muted)] opacity-50 group-hover:w-3 group-hover:bg-[var(--text-secondary)]"
                }`}
              />
              <span
                className={`font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                }`}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Versión Móvil (< 1024px): Barra inferior minimalista fija */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#08080A]/90 backdrop-blur-md px-5 py-3.5 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--text-primary)] uppercase">
          {activeSection.label}
        </span>

        <button
          type="button"
          onClick={() => onOpenDrawer()}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-primary)] border border-white/25 px-3.5 py-1.5 hover:bg-white hover:text-[#050505] transition-colors"
        >
          CONSULTAR ↗
        </button>
      </div>
    </>
  );
}
