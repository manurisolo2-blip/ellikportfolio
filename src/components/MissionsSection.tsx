"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MISSIONS } from "@/data/ellikData";
import { WarpCarousel, type WarpCard } from "@/components/ui/warp-carousel";

interface ProjectCarouselMeta {
  selectorLabel: string;
  cardTitle: string;
  cardCategory: string;
  glow: string;
  fallbackMesh: string[];
}

const PROJECT_CARD_META: Record<string, ProjectCarouselMeta> = {
  "mojo-grille": {
    selectorLabel: "Mojo Grille",
    cardTitle: "Mojo Grille",
    cardCategory: "Gastronomía · Miami",
    glow: "#F59E0B",
    fallbackMesh: ["#1A1205", "#291A06", "#3D260A", "#050505"],
  },
  dopamine: {
    selectorLabel: "Dopamine",
    cardTitle: "Dopamine\nStreetwear",
    cardCategory: "E-Commerce · Buenos Aires",
    glow: "#A855F7",
    fallbackMesh: ["#180A26", "#25103B", "#311552", "#050505"],
  },
  "lung-yai": {
    selectorLabel: "Lung Yai",
    cardTitle: "Lung Yai\nThai Tapas",
    cardCategory: "Guía Michelin · Miami",
    glow: "#EF4444",
    fallbackMesh: ["#240909", "#360E0E", "#4A1212", "#050505"],
  },
  "deportistas-rio3": {
    selectorLabel: "Río Tercero",
    cardTitle: "Capital del\nDeportista",
    cardCategory: "Institucional · Río Tercero",
    glow: "#38BDF8",
    fallbackMesh: ["#071824", "#0C2638", "#123650", "#050505"],
  },
};

export function MissionsSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const warpCards: WarpCard[] = useMemo(
    () =>
      MISSIONS.map((mission) => {
        const meta = PROJECT_CARD_META[mission.id];
        return {
          tag: mission.index,
          title: meta?.cardTitle ?? mission.shortTitle,
          category: meta?.cardCategory ?? mission.category,
          image: mission.secondaryImage,
          href: mission.liveUrl,
          glow: meta?.glow ?? "#F4F1EA",
          mesh: meta?.fallbackMesh,
        };
      }),
    []
  );

  const safeIndex =
    ((activeIndex % MISSIONS.length) + MISSIONS.length) % MISSIONS.length;
  const activeMission = MISSIONS[safeIndex] ?? MISSIONS[0];

  const handleCardClick = (clickedIdx: number) => {
    const targetMission = MISSIONS[clickedIdx];
    if (!targetMission) return;
    window.open(targetMission.liveUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="proyectos" className="relative py-24 lg:py-36">
      <div>
        {/* Encabezado editorial limpio */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
          <h2 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold tracking-[-0.035em] leading-none text-white">
            Obra reciente.
          </h2>

          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#71717A] md:pb-2">
            Arrastrá o usá ← → para explorar
          </p>
        </div>

        {/* Escenario WebGL2 WarpCarousel */}
        <div
          data-cursor="orbit"
          className="relative w-full h-[480px] md:h-[600px] border border-white/10 bg-[#050505] overflow-hidden"
        >
          <WarpCarousel
            cards={warpCards}
            background="#050505"
            warp={0.95}
            step={1}
            autoplay={true}
            interval={4.5}
            index={safeIndex}
            onIndexChange={setActiveIndex}
            onCardClick={handleCardClick}
            font='"Clash Display", "Satoshi", sans-serif'
            ariaLabel="Proyectos reales de ELLIK"
            style={{
              width: "100%",
              height: "100%",
              minHeight: 0,
              aspectRatio: "auto",
            }}
          />
        </div>

        {/* Panel editorial sincronizado debajo del carrusel */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start border-t border-white/15 pt-8">
          {/* Izquierda: Selector minimalista de los 4 proyectos */}
          <div className="lg:col-span-4 flex flex-col gap-1">
            {MISSIONS.map((mission, idx) => {
              const isActive = idx === safeIndex;
              const selectorLabel =
                PROJECT_CARD_META[mission.id]?.selectorLabel ??
                mission.shortTitle;

              return (
                <button
                  key={mission.id}
                  id={mission.id}
                  type="button"
                  data-cursor="action"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(idx)}
                  className={`group flex min-h-[44px] items-center justify-between border-b border-white/[0.06] last:border-b-0 py-2 text-left transition-colors duration-200 focus:outline-none ${
                    isActive
                      ? "text-[#FFFFFF]"
                      : "text-[#71717A] hover:text-white/85"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`font-mono text-[11px] tracking-[0.14em] transition-colors ${
                        isActive ? "text-[#F4F1EA]" : "text-[#52525B]"
                      }`}
                    >
                      {mission.index}
                    </span>
                    <span className="font-display text-lg md:text-xl font-medium tracking-[-0.02em]">
                      {selectorLabel}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={`h-[1px] transition-all duration-300 ${
                      isActive
                        ? "w-6 bg-[#FFFFFF]"
                        : "w-2 bg-white/20 group-hover:w-4 group-hover:bg-white/50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Centro: Descripción humana y highlight sincronizado */}
          <div className="lg:col-span-5 min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#71717A]">
                  {activeMission.category}
                </p>

                <p className="mt-3 font-sans text-base md:text-[17px] leading-relaxed text-[#A1A1AA]">
                  {activeMission.description}
                </p>

                <p className="mt-4 border-l-2 border-[#F4F1EA]/40 pl-3 font-sans text-sm leading-snug text-[#F4F1EA]">
                  {activeMission.highlight}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Derecha: Botón directo al sitio en vivo */}
          <div className="lg:col-span-3 flex lg:justify-end">
            <a
              href={activeMission.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="action"
              className="group/btn relative inline-flex min-h-[44px] items-center gap-3 overflow-hidden border border-white/30 px-6 py-3.5 font-mono text-xs font-medium tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:border-white self-start"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-white translate-y-[102%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0"
              />
              <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-300 group-hover/btn:text-[#050505] group-focus-visible/btn:text-[#050505]">
                <span>VISITAR SITIO EN VIVO</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
