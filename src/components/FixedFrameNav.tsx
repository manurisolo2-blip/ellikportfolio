"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleDot, Compass, Layers, Orbit, Send } from "lucide-react";
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
  const programmaticLockUntilRef = useRef<number>(0);

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

  const updateActiveByPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    if (performance.now() < programmaticLockUntilRef.current) return;

    if (window.scrollY < 80) {
      setActiveId(NAV_SECTIONS[0].id);
      return;
    }

    const docEl = document.documentElement;
    if (
      window.scrollY + window.innerHeight >=
      docEl.scrollHeight - 120
    ) {
      const last = NAV_SECTIONS[NAV_SECTIONS.length - 1];
      if (last) setActiveId(last.id);
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

  const scrollToSection = useCallback((id: string) => {
    programmaticLockUntilRef.current = performance.now() + 850;
    setActiveId(id);

    if (id === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    if (id === "proyectos") {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const holdOffset = Math.min(
        200,
        Math.round(Math.max(0, el.offsetHeight - window.innerHeight) * 0.15)
      );
      window.scrollTo({ top: top + holdOffset, behavior: "smooth" });
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "start" });
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

      {/* Desktop (>= 1024px): Liquid Glass Navbar vertical en el margen derecho */}
      <div
        data-cursor="action"
        className="hidden lg:flex fixed right-6 xl:right-8 top-1/2 -translate-y-1/2 z-40"
      >
        <LiquidNavbar
          items={navItems}
          active={activeIndex}
          onChange={handleNavChange}
          orientation="vertical"
          tone="dark"
          compact={true}
          sound={false}
          ariaLabel="Navegación principal"
        />
      </div>

      {/* Móvil (< 1024px): Píldora flotante horizontal inferior */}
      <div
        data-cursor="action"
        className="flex lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
      >
        <LiquidNavbar
          items={navItems}
          active={activeIndex}
          onChange={handleNavChange}
          orientation="horizontal"
          tone="dark"
          compact={true}
          sound={false}
          ariaLabel="Navegación principal"
        />
      </div>
    </>
  );
}
