"use client";

import React, { useEffect, useState } from "react";
import { NAV_SECTIONS, type BusinessCategory } from "@/data/ellikData";
import { EllikLogo } from "./EllikLogo";

interface FixedFrameNavProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function FixedFrameNav({ onOpenDrawer }: FixedFrameNavProps) {
  const [activeId, setActiveId] = useState<string>(NAV_SECTIONS[0].id);

  useEffect(() => {
    const sectionElements = NAV_SECTIONS.map((s) =>
      document.getElementById(s.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const visibilityMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        });

        let bestId: string | null = null;
        let maxRatio = 0;

        for (const section of NAV_SECTIONS) {
          const ratio = visibilityMap.get(section.id) ?? 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            bestId = section.id;
          }
        }

        if (bestId !== null) {
          setActiveId(bestId);
        }
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

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
        href="#orbita"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("orbita");
        }}
        aria-label="ELLIK — Volver al inicio"
        className="fixed top-6 left-6 lg:top-8 lg:left-10 z-40 text-[var(--text-primary)] transition-opacity hover:opacity-80"
      >
        <EllikLogo />
      </a>

      {/* Esquina Superior Derecha: Acción de contacto directa */}
      <button
        type="button"
        onClick={() => onOpenDrawer()}
        className="fixed top-6 right-6 lg:top-8 lg:right-10 z-40 telemetry-label text-[11px] sm:text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent-starlight)] transition-colors py-1"
      >
        INICIAR CONTACTO ↗
      </button>

      {/* Índice Lateral Izquierdo con Scroll-Spy (Desktop >= 1024px) */}
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
              className="group flex items-center gap-3 text-left focus:outline-none"
            >
              <span
                className={`block h-2 w-2 transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--text-primary)] scale-100"
                    : "bg-transparent border border-[var(--text-muted)] scale-75 opacity-60 group-hover:opacity-100 group-hover:border-[var(--text-secondary)]"
                }`}
              />
              <span
                className={`font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                }`}
              >
                {section.code} // {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Versión Móvil (< 1024px): Barra inferior minimalista fija */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#08080A]/90 backdrop-blur-md px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 bg-[var(--text-primary)] inline-block shrink-0" />
          <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--text-primary)] uppercase">
            {activeSection.code} // {activeSection.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenDrawer()}
          className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--text-primary)] border border-white/25 px-3.5 py-1.5 hover:bg-white hover:text-[#050505] transition-colors"
        >
          CONSULTAR ↗
        </button>
      </div>
    </>
  );
}
