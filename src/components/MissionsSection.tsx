"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MISSIONS } from "@/data/ellikData";
import { WarpCarousel, type WarpCard } from "@/components/ui/warp-carousel";

interface ProjectCardVisualMeta {
  title: string;
  shortCategory: string;
  glow: string;
  accent: string;
}

const PROJECT_CARD_META: Record<string, ProjectCardVisualMeta> = {
  "mojo-grille": {
    title: "Mojo\nGrille",
    shortCategory: "Gastronomía",
    glow: "#E06D3B",
    accent: "#F4A261",
  },
  dopamine: {
    title: "Dopamine\nStreetwear",
    shortCategory: "E-Commerce",
    glow: "#C4CDD5",
    accent: "#F4F1EA",
  },
  "lung-yai": {
    title: "Lung Yai\nThai Tapas",
    shortCategory: "Michelin · Miami",
    glow: "#C84B31",
    accent: "#E07A5F",
  },
  "deportistas-rio3": {
    title: "Capital del\nDeportista",
    shortCategory: "Institucional",
    glow: "#3B82A6",
    accent: "#7FB3D5",
  },
};

export function MissionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex =
    activeIndex >= 0 && activeIndex < MISSIONS.length ? activeIndex : 0;
  const activeMission = MISSIONS[safeIndex];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    mass: 0.4,
  });

  const stageScale = useTransform(
    smoothProgress,
    [0.04, 0.28, 0.72, 0.96],
    [0.76, 1, 1, 0.76]
  );
  const stageOpacity = useTransform(
    smoothProgress,
    [0.02, 0.22, 0.78, 0.98],
    [0.28, 1, 1, 0.28]
  );
  const stageY = useTransform(
    smoothProgress,
    [0.04, 0.28, 0.72, 0.96],
    [28, 0, 0, -28]
  );
  const frameBorderOpacity = useTransform(
    smoothProgress,
    [0.16, 0.28, 0.72, 0.84],
    [1, 0, 0, 1]
  );

  useEffect(() => {
    const selectById = (id: string) => {
      if (!id) return;
      const found = MISSIONS.findIndex((m) => m.id === id);
      if (found >= 0) setActiveIndex(found);
    };

    const syncFromHash = () => {
      selectById(window.location.hash.replace(/^#/, ""));
    };

    const onSelectProject = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id) selectById(id);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("ellik:select-project", onSelectProject);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("ellik:select-project", onSelectProject);
    };
  }, []);

  const cards = useMemo<WarpCard[]>(() => {
    return MISSIONS.map((mission) => {
      const meta = PROJECT_CARD_META[mission.id] ?? {
        title: mission.shortTitle,
        shortCategory: mission.category,
        glow: "#F4F1EA",
        accent: "#F4F1EA",
      };

      return {
        title: meta.title,
        category: meta.shortCategory,
        tag: mission.index,
        image: mission.secondaryImage,
        hideOverlay: true,
        href: mission.liveUrl,
        glow: meta.glow,
        accent: meta.accent,
      };
    });
  }, []);

  const handleIndexChange = useCallback((nextIndex: number) => {
    const total = MISSIONS.length;
    const normalized = ((nextIndex % total) + total) % total;
    setActiveIndex(normalized);
  }, []);

  const handleCardClick = useCallback(
    (clickedIndex: number) => {
      const total = MISSIONS.length;
      const normalized = ((clickedIndex % total) + total) % total;
      if (normalized === safeIndex) {
        const url = MISSIONS[normalized]?.liveUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setActiveIndex(normalized);
      }
    },
    [safeIndex]
  );

  return (
    <section
      ref={sectionRef}
      id="proyectos"
      className="relative z-[44] w-full h-[220vh] md:h-[250vh]"
    >
      {MISSIONS.map((mission) => (
        <span
          key={`anchor-${mission.id}`}
          id={mission.id}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[8%] h-px w-px"
        />
      ))}

      <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center overflow-hidden">
        <motion.div
          style={{
            scale: stageScale,
            opacity: stageOpacity,
            y: stageY,
          }}
          className="relative flex h-full w-full flex-col justify-between bg-[#050505] overflow-hidden will-change-[transform,opacity]"
        >
          <motion.div
            aria-hidden="true"
            style={{ opacity: frameBorderOpacity }}
            className="pointer-events-none absolute inset-0 z-30 border border-white/20"
          />

          {/* Encabezado compacto dentro del escenario fullscreen */}
          <header className="relative z-20 shrink-0 flex items-center justify-between gap-4 border-b border-white/10 bg-[#050505]/95 px-6 md:px-12 py-4 md:py-5">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-none">
              Obra reciente.
            </h2>

            <div className="flex items-center gap-5">
              <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
                Arrastrá o usá ← →
              </span>
              <span className="font-mono text-xs sm:text-sm tracking-[0.18em] text-[#F4F1EA] tabular-nums">
                {activeMission.index} / 0{MISSIONS.length}
              </span>
            </div>
          </header>

          {/* Escenario WebGL2 WarpCarousel ocupando todo el centro */}
          <div
            data-cursor="orbit"
            className="relative flex-1 min-h-0 w-full"
          >
            <WarpCarousel
              cards={cards}
              index={safeIndex}
              onIndexChange={handleIndexChange}
              onCardClick={handleCardClick}
              autoplay={false}
              background="#050505"
              warp={0.65}
              className="h-full w-full"
              style={{ minHeight: 280, aspectRatio: "auto" }}
              ariaLabel="Proyectos seleccionados de ELLIK"
            />
          </div>

          {/* Dock inferior compacto en 2 filas: selectores + CTA arriba, ficha editorial debajo */}
          <div className="relative z-20 shrink-0 border-t border-white/10 bg-[#050505]/95 px-6 md:px-12 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Selectores directos de proyecto */}
              <div
                className="flex flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Seleccionar proyecto"
              >
                {MISSIONS.map((mission, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={mission.id}
                      data-project-tab={mission.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveIndex(idx)}
                      data-cursor="action"
                      className={`min-h-[44px] inline-flex items-center gap-2 border px-3.5 py-2 font-mono text-[11px] sm:text-xs tracking-[0.12em] uppercase transition-colors duration-200 ${
                        isActive
                          ? "border-white bg-white text-[#050505] font-medium"
                          : "border-white/15 bg-transparent text-white/65 hover:border-white/45 hover:text-white"
                      }`}
                    >
                      <span
                        className={
                          isActive ? "text-[#050505]/70" : "text-white/40"
                        }
                      >
                        {mission.index}
                      </span>
                      <span>{mission.shortTitle}</span>
                    </button>
                  );
                })}
              </div>

              {/* Botón directo al sitio en vivo en una sola línea */}
              <a
                href={activeMission.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="action"
                className="group/btn relative inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2.5 whitespace-nowrap overflow-hidden border border-white/35 px-5 py-3 font-mono text-xs font-medium tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:border-white"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-white translate-y-[102%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0"
                />
                <span className="relative z-10 inline-flex items-center gap-2.5 whitespace-nowrap transition-colors duration-300 group-hover/btn:text-[#050505] group-focus-visible/btn:text-[#050505]">
                  <span>VISITAR SITIO EN VIVO</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </span>
              </a>
            </div>

            {/* Ficha editorial del proyecto activo con ancho cómodo */}
            <div className="mt-3 pt-3 border-t border-white/[0.08]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMission.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1.5 md:gap-8"
                >
                  <p className="hidden sm:block text-sm leading-relaxed text-white/75 line-clamp-1 max-w-3xl">
                    {activeMission.description}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#F4F1EA]/90 md:shrink-0 md:text-right leading-snug">
                    {activeMission.category} · {activeMission.highlight}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default MissionsSection;
