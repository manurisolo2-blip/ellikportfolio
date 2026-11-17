"use client";

import React, { useCallback, useEffect, useState } from "react";
import { NAV_SECTIONS, type BusinessCategory } from "@/data/ellikData";
import { MagneticButton } from "./AnimatedHeading";
import { EllikLogo } from "./EllikLogo";

interface FixedFrameNavProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function FixedFrameNav({ onOpenDrawer }: FixedFrameNavProps) {
  const [activeId, setActiveId] = useState<string>(NAV_SECTIONS[0].id);

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
        className="fixed top-4 left-6 lg:top-8 lg:left-10 z-40 inline-flex min-h-[44px] items-center text-white mix-blend-difference transition-opacity hover:opacity-80"
      >
        <EllikLogo />
      </a>

      {/* Esquina Superior Derecha: Acción magnética de contacto directo */}
      <div className="fixed top-4 right-6 lg:top-8 lg:right-10 z-40">
        <MagneticButton
          onClick={() => onOpenDrawer()}
          className="inline-flex min-h-[44px] items-center border border-[rgba(255,255,255,0.20)] bg-[#050505] px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:border-[#FFFFFF]"
        >
          INICIAR CONTACTO ↗
        </MagneticButton>
      </div>

      {/* Índice Lateral Izquierdo con Scroll-Spy (Desktop >= 1024px) */}
      <nav
        aria-label="Índice de secciones"
        className="fixed left-16 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 mix-blend-difference"
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
                    ? "w-4 bg-white"
                    : "w-2 bg-white/45 group-hover:w-3 group-hover:bg-white/80"
                }`}
              />
              <span
                className={`font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 ${
                  isActive
                    ? "text-white font-medium"
                    : "text-[#A1A1AA] group-hover:text-white"
                }`}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Versión Móvil (< 1024px): Barra inferior minimalista fija */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#08080A]/90 backdrop-blur-md px-5 py-2 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--text-primary)] uppercase">
          {activeSection.label}
        </span>

        <button
          type="button"
          onClick={() => onOpenDrawer()}
          className="inline-flex min-h-[44px] items-center font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-primary)] border border-white/25 px-4 py-2.5 hover:bg-white hover:text-[#050505] transition-colors"
        >
          CONSULTAR ↗
        </button>
      </div>
    </>
  );
}
