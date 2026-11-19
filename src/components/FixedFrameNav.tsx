"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Activity, CircleDot, Compass, Layers, Orbit, Send } from "lucide-react";
import { NAV_SECTIONS, type BusinessCategory } from "@/data/ellikData";
import { MagneticButton } from "./AnimatedHeading";
import { EllikLogo } from "./EllikLogo";
import {
  LiquidNavbar,
  type LiquidNavFx,
  type LiquidNavItem,
} from "./ui/liquid-glass-navbar";

interface FixedFrameNavProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

const ICON_PROPS = { size: 18, strokeWidth: 1.7 } as const;

function buildNavItemMeta(sectionId: string, fallbackLabel: string): {
  label: string;
  icon: React.ReactNode;
  fx: LiquidNavFx;
} {
  switch (sectionId) {
    case "inicio":
      return {
        label: "Inicio",
        icon: <Orbit {...ICON_PROPS} />,
        fx: "spin",
      };
    case "problema":
      return {
        label: "El problema",
        icon: <Activity {...ICON_PROPS} />,
        fx: "pop",
      };
    case "proyectos":
      return {
        label: "Obra",
        icon: <Layers {...ICON_PROPS} />,
        fx: "pop",
      };
    case "servicios":
      return {
        label: "Qué hago",
        icon: <Compass {...ICON_PROPS} />,
        fx: "drop",
      };
    case "contacto":
      return {
        label: "Contacto",
        icon: <Send {...ICON_PROPS} />,
        fx: "plane",
      };
    default:
      return {
        label: fallbackLabel,
        icon: <CircleDot {...ICON_PROPS} />,
        fx: "pop",
      };
  }
}

export function FixedFrameNav({ onOpenDrawer }: FixedFrameNavProps) {
  const [activeId, setActiveId] = useState<string>(NAV_SECTIONS[0].id);
  const [isOverLightSection, setIsOverLightSection] = useState<boolean>(false);
  const programmaticLockUntilRef = useRef<number>(0);
  const programmaticTargetTopRef = useRef<number | null>(null);

  const navItems = useMemo<LiquidNavItem[]>(
    () =>
      NAV_SECTIONS.map((section) => {
        const meta = buildNavItemMeta(section.id, section.label);
        return {
          id: section.id,
          label: meta.label,
          icon: meta.icon,
          fx: meta.fx,
        };
      }),
    []
  );

  const activeIndex = useMemo(() => {
    const idx = NAV_SECTIONS.findIndex((s) => s.id === activeId);
    return idx >= 0 ? idx : 0;
  }, [activeId]);

  const syncLightTone = useCallback(() => {
    if (typeof window === "undefined") return;
    const serviciosEl = document.getElementById("servicios");
    if (!serviciosEl) return;
    const sRect = serviciosEl.getBoundingClientRect();
    const zoneY =
      window.innerWidth >= 1024
        ? window.innerHeight * 0.5
        : window.innerHeight - 44;
    const overLight = sRect.top <= zoneY && sRect.bottom >= zoneY;
    setIsOverLightSection((prev) => (prev === overLight ? prev : overLight));
  }, []);

  const updateActiveByPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    syncLightTone();

    const now = performance.now();
    if (now < programmaticLockUntilRef.current) {
      if (
        programmaticTargetTopRef.current !== null &&
        Math.abs(window.scrollY - programmaticTargetTopRef.current) <= 8
      ) {
        programmaticLockUntilRef.current = 0;
        programmaticTargetTopRef.current = null;
      } else {
        return;
      }
    }

    if (window.scrollY < 100) {
      setActiveId(NAV_SECTIONS[0].id);
      return;
    }

    const docEl = document.documentElement;
    if (
      window.scrollY + window.innerHeight >=
      docEl.scrollHeight - 160
    ) {
      const last = NAV_SECTIONS[NAV_SECTIONS.length - 1];
      if (last) setActiveId(last.id);
      return;
    }

    const triggerY = window.innerHeight * 0.45;
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
  }, [syncLightTone]);

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

    const serviciosEl = document.getElementById("servicios");
    const lightObserver = serviciosEl
      ? new IntersectionObserver(
          () => {
            syncLightTone();
          },
          {
            rootMargin: "-35% 0px -35% 0px",
            threshold: [0, 0.05, 0.5, 1],
          }
        )
      : null;

    if (serviciosEl && lightObserver) {
      lightObserver.observe(serviciosEl);
    }

    const clearLockOnManualScroll = () => {
      programmaticLockUntilRef.current = 0;
      programmaticTargetTopRef.current = null;
    };

    sectionElements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", updateActiveByPosition, { passive: true });
    window.addEventListener("resize", updateActiveByPosition, { passive: true });
    window.addEventListener("wheel", clearLockOnManualScroll, { passive: true });
    window.addEventListener("touchmove", clearLockOnManualScroll, {
      passive: true,
    });
    updateActiveByPosition();

    return () => {
      observer.disconnect();
      lightObserver?.disconnect();
      window.removeEventListener("scroll", updateActiveByPosition);
      window.removeEventListener("resize", updateActiveByPosition);
      window.removeEventListener("wheel", clearLockOnManualScroll);
      window.removeEventListener("touchmove", clearLockOnManualScroll);
    };
  }, [syncLightTone, updateActiveByPosition]);

  const scrollToSection = useCallback((id: string) => {
    if (typeof window === "undefined") return;

    setActiveId(id);

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    let targetTop = 0;

    if (id !== "inicio") {
      const el = document.getElementById(id);
      if (!el) return;

      const sectionTop = el.getBoundingClientRect().top + window.scrollY;

      if (id === "problema") {
        targetTop = Math.min(maxScroll, Math.max(0, Math.round(sectionTop + 2)));
      } else if (id === "proyectos") {
        // Aterrizar directamente dentro de la meseta fullscreen (scale = 1, opacity = 1)
        const scrollRange = Math.max(0, el.offsetHeight - window.innerHeight);
        const holdOffset = Math.round(scrollRange * 0.38);
        targetTop = Math.min(maxScroll, Math.max(0, sectionTop + holdOffset));
      } else if (id === "servicios") {
        // Encuadrar título + primera tarjeta apilable completa en pantalla
        targetTop = Math.min(maxScroll, Math.max(0, Math.round(sectionTop + 36)));
      } else {
        // Contacto (#contacto)
        targetTop = Math.min(maxScroll, Math.max(0, Math.round(sectionTop - 20)));
      }
    }

    programmaticTargetTopRef.current = targetTop;
    programmaticLockUntilRef.current = performance.now() + 1300;

    const lenis = window.__ellikLenis;
    if (lenis) {
      lenis.scrollTo(targetTop, {
        duration: 1.05,
        force: true,
        lock: false,
        onComplete: () => {
          programmaticLockUntilRef.current = 0;
          programmaticTargetTopRef.current = null;
        },
      });
    } else {
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  }, []);

  const handleNavChange = useCallback(
    (index: number) => {
      const target = NAV_SECTIONS[index];
      if (!target) return;
      scrollToSection(target.id);
    },
    [scrollToSection]
  );

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
        className="fixed top-4 left-6 lg:top-8 lg:left-10 z-[48] inline-flex min-h-[44px] items-center text-white mix-blend-difference transition-opacity hover:opacity-80"
      >
        <EllikLogo />
      </a>

      {/* Esquina Superior Derecha: Acción magnética de contacto directo */}
      <div className="fixed top-4 right-6 lg:top-8 lg:right-10 z-[48] mix-blend-difference text-white">
        <MagneticButton
          onClick={() => onOpenDrawer()}
          className="inline-flex min-h-[44px] items-center border border-white/35 bg-transparent px-4 py-2.5 font-sans font-medium text-[11px] tracking-[0.18em] uppercase text-white transition-colors duration-200 hover:border-white"
        >
          INICIAR CONTACTO ↗
        </MagneticButton>
      </div>

      {/* Desktop (>= 1024px): Liquid Glass Navbar vertical en el margen derecho */}
      <div
        data-cursor="action"
        className="hidden lg:flex fixed right-6 xl:right-8 top-1/2 -translate-y-1/2 z-[48]"
      >
        <LiquidNavbar
          items={navItems}
          active={activeIndex}
          onChange={handleNavChange}
          orientation="vertical"
          tone={isOverLightSection ? "light" : "dark"}
          compact={true}
          sound={false}
          ariaLabel="Navegación principal"
        />
      </div>

      {/* Móvil (< 1024px): Píldora flotante horizontal inferior */}
      <div
        data-cursor="action"
        className="flex lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[48]"
      >
        <LiquidNavbar
          items={navItems}
          active={activeIndex}
          onChange={handleNavChange}
          orientation="horizontal"
          tone={isOverLightSection ? "light" : "dark"}
          compact={true}
          sound={false}
          ariaLabel="Navegación principal"
        />
      </div>
    </>
  );
}
