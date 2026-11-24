"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { MISSIONS, MISSIONS_BY_LOCALE } from "@/data/ellikData";
import { useLanguage } from "@/context/LanguageContext";
import {
  APPLE_SPRING_SNAPPY,
  triggerHaptic,
  useHydratedReducedMotion,
} from "@/lib/fluidPhysics";
import { WarpCarousel, type WarpCard } from "@/components/ui/warp-carousel";

const MISSIONS_SCOPED_CSS = `
.ellik-missions-pill {
  border-radius: 9999px !important;
}
`;

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
    shortCategory: "Michelin, Miami",
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
  const { locale } = useLanguage();
  const missions = MISSIONS_BY_LOCALE[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useHydratedReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const safeIndex =
    activeIndex >= 0 && activeIndex < missions.length ? activeIndex : 0;
  const activeMission = missions[safeIndex];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const stageScale = useTransform(
    scrollYProgress,
    [0.04, 0.28, 0.72, 0.96],
    [0.76, 1, 1, 0.76]
  );
  const stageOpacity = useTransform(
    scrollYProgress,
    [0.02, 0.22, 0.78, 0.98],
    [0.28, 1, 1, 0.28]
  );
  const stageY = useTransform(
    scrollYProgress,
    [0.04, 0.28, 0.72, 0.96],
    [28, 0, 0, -28]
  );
  const frameBorderOpacity = useTransform(
    scrollYProgress,
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

  const handleIndexChange = useCallback(
    (nextIndex: number) => {
      const total = MISSIONS.length;
      const normalized = ((nextIndex % total) + total) % total;
      if (normalized !== safeIndex) {
        const forwardDist = (normalized - safeIndex + total) % total;
        setDirection(forwardDist <= total / 2 ? 1 : -1);
      }
      setActiveIndex(normalized);
    },
    [safeIndex]
  );

  const handlePrev = useCallback(() => {
    setDirection(-1);
    triggerHaptic(6);
    handleIndexChange(safeIndex - 1);
  }, [handleIndexChange, safeIndex]);

  const handleNext = useCallback(() => {
    setDirection(1);
    triggerHaptic(6);
    handleIndexChange(safeIndex + 1);
  }, [handleIndexChange, safeIndex]);

  const handleCardClick = useCallback(
    (clickedIndex: number) => {
      const total = MISSIONS.length;
      const normalized = ((clickedIndex % total) + total) % total;
      if (normalized === safeIndex) {
        const url = MISSIONS[normalized]?.liveUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } else {
        triggerHaptic(6);
        handleIndexChange(normalized);
      }
    },
    [handleIndexChange, safeIndex]
  );

  return (
    <section
      ref={sectionRef}
      id="proyectos"
      className="relative z-[44] w-full h-[220vh] md:h-[250vh]"
    >
      <style>{MISSIONS_SCOPED_CSS}</style>
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
          <header className="relative z-20 shrink-0 flex items-center justify-between gap-3 sm:gap-4 border-b border-white/10 bg-[#050505]/95 pt-[76px] lg:pt-[92px] pb-3.5 md:pb-4 px-5 sm:pl-28 sm:pr-10 lg:pl-32 lg:pr-28 xl:pl-36 xl:pr-32">
            <h2 className="font-display text-[21px] sm:text-3xl md:text-4xl font-semibold tracking-[-0.015em] [word-spacing:0.06em] text-white leading-none whitespace-nowrap">
              {locale === "es" ? "Obra reciente." : "Selected work."}
            </h2>

            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <span className="hidden xl:inline text-[11px] font-sans text-white/35 mr-2">
                {locale === "es" ? "Deslizá o elegí" : "Drag or pick"}
              </span>

              <div
                data-missions-counter
                className="flex items-baseline select-none whitespace-nowrap shrink-0"
              >
                <span className="relative inline-flex overflow-hidden min-w-[2.2ch] justify-end">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={activeMission.index}
                      initial={
                        reducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: direction * 6 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: direction * -6 }
                      }
                      transition={
                        reducedMotion
                          ? { duration: 0.14 }
                          : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                      }
                      className="font-display font-medium text-xl sm:text-2xl text-[var(--accent-signal)] tabular-nums leading-none"
                    >
                      {activeMission.index}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="font-sans text-xs text-white/35 tabular-nums ml-1 whitespace-nowrap shrink-0">
                  / {String(missions.length).padStart(2, "0")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-missions-prev
                  data-cursor="action"
                  aria-label={
                    locale === "es" ? "Proyecto anterior" : "Previous project"
                  }
                  onClick={handlePrev}
                  className="ellik-missions-pill w-9 h-9 rounded-full border border-white/15 bg-white/[0.02] hover:border-white/50 hover:bg-white/[0.08] flex items-center justify-center text-white/80 hover:text-white transition-all duration-100 active:scale-[0.92] cursor-pointer"
                >
                  <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-missions-next
                  data-cursor="action"
                  aria-label={
                    locale === "es" ? "Proyecto siguiente" : "Next project"
                  }
                  onClick={handleNext}
                  className="ellik-missions-pill w-9 h-9 rounded-full border border-white/15 bg-white/[0.02] hover:border-white/50 hover:bg-white/[0.08] flex items-center justify-center text-white/80 hover:text-white transition-all duration-100 active:scale-[0.92] cursor-pointer"
                >
                  <ArrowRight size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
              </div>
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
              ariaLabel={
                locale === "es"
                  ? "Proyectos seleccionados de ELLIK"
                  : "Selected projects by ELLIK"
              }
            />
          </div>

          {/* Dock inferior editorial: meta + título + descripción en 3 niveles y CTA directo */}
          <div className="relative z-20 shrink-0 border-t border-white/[0.08] bg-[#050505]/95 px-6 sm:pl-28 sm:pr-10 lg:pl-32 lg:pr-28 xl:pl-36 xl:pr-32 pt-5 md:pt-6 pb-20 lg:pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-6">
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeMission.id}
                    initial={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: direction * 10 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: direction * -10 }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0.14 }
                        : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                    }
                    data-missions-meta={activeMission.id}
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-2.5">
                      <span className="font-sans font-medium text-[11px] uppercase tracking-[0.14em] text-white/50">
                        {activeMission.category}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden sm:block ellik-missions-pill w-1 h-1 rounded-full bg-white/25 shrink-0"
                      />
                      <span className="ellik-missions-pill text-[11px] font-sans font-medium text-[#F4F1EA]/90 bg-white/[0.06] border border-white/[0.12] px-2.5 py-0.5 rounded-full">
                        {activeMission.highlight}
                      </span>
                    </div>

                    <h3 className="font-display font-medium text-2xl sm:text-3xl tracking-[-0.01em] [word-spacing:0.06em] text-white leading-tight mb-2">
                      {activeMission.title}
                    </h3>

                    <p className="max-w-xl font-sans text-sm sm:text-[15px] text-[#A1A1AA] leading-relaxed">
                      {activeMission.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Botón directo al sitio en vivo */}
              <a
                href={activeMission.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-missions-cta
                data-cursor="action"
                className="group/btn relative inline-flex min-h-[44px] shrink-0 self-start md:self-auto items-center justify-center gap-2.5 whitespace-nowrap overflow-hidden border border-white/30 px-5 py-3 font-sans font-medium text-[11px] tracking-[0.16em] uppercase text-white transition-[border-color,transform] duration-150 ease-out active:scale-[0.97] hover:border-[var(--accent-signal)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[var(--accent-signal)] translate-y-[102%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0"
                />
                <span className="relative z-10 inline-flex items-center gap-2.5 whitespace-nowrap transition-colors duration-300 group-hover/btn:text-[var(--accent-signal-ink)] group-focus-visible/btn:text-[var(--accent-signal-ink)]">
                  <span>
                    {locale === "es" ? "VISITAR SITIO EN VIVO" : "VISIT LIVE SITE"}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default MissionsSection;
