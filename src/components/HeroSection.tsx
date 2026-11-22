"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  MISSIONS,
  MISSIONS_BY_LOCALE,
  type BusinessCategory,
  type Mission,
} from "@/data/ellikData";
import { useLanguage } from "@/context/LanguageContext";
import { MagneticButton } from "./AnimatedHeading";

const EllikEmblem3D = dynamic(
  () => import("./EllikEmblem3D").then((m) => m.EllikEmblem3D),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="pointer-events-none h-[260px] w-[260px] sm:h-[280px] sm:w-[280px] md:h-[400px] md:w-[400px]"
      />
    ),
  }
);

interface HeroSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

interface OrbitScreenConfig {
  key: string;
  mission: Mission;
  baseAngle: number;
  offsetY: number;
  tiltX: number;
  tiltZ: number;
  radiusScale: number;
}

/**
 * 4 lienzos web reales en órbita espacial alrededor del Sol ELLIK,
 * distribuidos a distintas alturas y planos de profundidad desde el primer frame.
 */
const ORBIT_SCREENS: OrbitScreenConfig[] = [
  {
    key: "orbit-screen-mojo",
    mission: MISSIONS[0], // Mojo Grille: arriba a la izquierda en primer plano (Z > 0)
    baseAngle: 326,
    offsetY: -135,
    tiltX: 10,
    tiltZ: -5.5,
    radiusScale: 1.0,
  },
  {
    key: "orbit-screen-dopamine",
    mission: MISSIONS[1], // Dopamine: abajo a la derecha en primer plano (Z > 0)
    baseAngle: 44,
    offsetY: 128,
    tiltX: -11,
    tiltZ: 4.5,
    radiusScale: 0.98,
  },
  {
    key: "orbit-screen-lungyai",
    mission: MISSIONS[2], // Lung Yai: centro profundo detrás del núcleo y título (Z < 0)
    baseAngle: 170,
    offsetY: -18,
    tiltX: 6,
    tiltZ: -3.5,
    radiusScale: 0.94,
  },
  {
    key: "orbit-screen-rio3",
    mission: MISSIONS[3], // Capital del Deportista: cuadrante inferior izquierdo trasero (Z < 0)
    baseAngle: 242,
    offsetY: 108,
    tiltX: -8,
    tiltZ: 5.5,
    radiusScale: 1.04,
  },
];

function OrbitFallback({ variant }: { variant?: Mission["fallbackVariant"] }) {
  const accent =
    variant === "gastro-1"
      ? "rgba(217, 167, 96, 0.25)"
      : "rgba(244, 241, 234, 0.2)";

  return (
    <div
      className="h-full w-full"
      style={{
        background: `radial-gradient(circle at 70% 30%, ${accent} 0%, #09090B 72%)`,
      }}
    />
  );
}

interface FloatingScreenSurfaceProps {
  mission: Mission;
  sheenRef: (el: HTMLDivElement | null) => void;
  priority: boolean;
}

function FloatingScreenSurface({
  mission,
  sheenRef,
  priority,
}: FloatingScreenSurfaceProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#08080A]">
      {imgFailed ? (
        <OrbitFallback variant={mission.fallbackVariant} />
      ) : (
        <Image
          src={mission.previewImage}
          alt={mission.title}
          fill
          sizes="(max-width: 640px) 256px, (max-width: 1024px) 290px, 370px"
          quality={90}
          priority={priority}
          draggable={false}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      )}

      {/* Reflejo diagonal especular sutil sin apagar los colores reales */}
      <div
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-[200%] will-change-transform"
        style={{
          background:
            "linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.06) 39%, rgba(255, 255, 255, 0.24) 48%, rgba(255, 255, 255, 0.05) 57%, transparent 72%)",
          opacity: 0,
        }}
      />
    </div>
  );
}

const INITIAL_ORBIT_ANGLE = 0;
const DEFAULT_RADIUS_Z = 345;
const DEFAULT_Y_SCALE = 1;

interface ScreenFrame {
  transform: string;
  zIndex: number;
  opacity: number;
  sheenTranslateX: number;
  sheenOpacity: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function computeScreenFrame(
  cfg: OrbitScreenConfig,
  orbitAngle: number,
  effectiveRadiusZ: number,
  yScale: number,
  isHovered: boolean,
  isDimmedByHover: boolean,
  scrollP: number
): ScreenFrame {
  const worldDeg = orbitAngle + cfg.baseAngle;
  const rad = (worldDeg * Math.PI) / 180;

  const sinVal = Math.sin(rad);
  const zCos = Math.cos(rad); // -1 atrás profundo, +1 frente cercano

  const p = clamp(scrollP, 0, 1);
  const scatterFactor = 1 + p * 1.1; // 1x -> 2.1x dispersión radial

  const rZ = effectiveRadiusZ * cfg.radiusScale * scatterFactor;
  const rX = rZ * 1.28;

  const x = sinVal * rX;
  const z = zCos * rZ;
  const y = cfg.offsetY * yScale * (1 + p * 0.7);

  // Inclinación 3D hacia el centro, acentuándose al dispersarse en el portal
  const rotateY = -sinVal * (35 + p * 24);
  const elevationPitch = -(y / Math.max(rZ, 1)) * 7;
  const tiltOut = (y >= 0 ? -1 : 1) * p * 14;
  const rotateX = clamp(cfg.tiltX + elevationPitch + tiltOut, -28, 28);
  const rotateZ = cfg.tiltZ + (sinVal >= 0 ? 1 : -1) * p * 10;

  // Escala continua por profundidad Z (más pequeña atrás, mayor al frente)
  const depthScale =
    z >= 0 ? 0.9 + zCos * 0.2 : 0.9 + zCos * 0.22; // 0.68 atrás .. 1.10 adelante

  const exitFade = p <= 0.68 ? 1 : Math.max(0, 1 - (p - 0.68) / 0.32);

  const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
    1
  )}px, ${z.toFixed(1)}px) rotateY(${rotateY.toFixed(
    2
  )}deg) rotateX(${rotateX.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(
    2
  )}deg) scale(${depthScale.toFixed(4)})`;

  if (z >= 0) {
    // Plano frontal (Z > 0): fidelidad cromática real por delante del emblema (z >= 20)
    const frontFactor = zCos;
    return {
      transform,
      zIndex: isHovered ? 50 : 20 + Math.round(frontFactor * 20),
      opacity: (isDimmedByHover ? 0.48 : 1) * exitFade,
      sheenTranslateX: -sinVal * 42,
      sheenOpacity: isHovered ? 0.92 : 0.16 + frontFactor * 0.38,
    };
  }

  // Plano trasero (Z < 0): detrás del emblema central (zIndex 1..8 < 10), profundidad vía opacidad GPU
  const rearDepth = Math.min(1, -zCos);
  const rearOpacity = (0.76 - rearDepth * 0.28) * exitFade;

  return {
    transform,
    zIndex: Math.max(1, 8 + Math.round(zCos * 7)),
    opacity: isDimmedByHover ? Math.min(rearOpacity, 0.34) : rearOpacity,
    sheenTranslateX: 0,
    sheenOpacity: 0,
  };
}

export function HeroSection({ onOpenDrawer }: HeroSectionProps) {
  const { locale } = useLanguage();
  const localizedMissions = MISSIONS_BY_LOCALE[locale];
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const screenRefs = useRef<Array<HTMLDivElement | null>>([]);
  const sheenRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Estado orbital y arrastre físico con inercia
  const orbitAngleRef = useRef<number>(INITIAL_ORBIT_ANGLE);
  const angularVelocityRef = useRef<number>(0);
  const baseSpeedFactorRef = useRef<number>(1);
  const targetSpeedFactorRef = useRef<number>(1);
  const scrollProgressRef = useRef<number>(0);
  const hoveredIndexRef = useRef<number | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragLastXRef = useRef<number>(0);
  const totalDragDistanceRef = useRef<number>(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDraggingOrbit, setIsDraggingOrbit] = useState<boolean>(false);
  const [finePointer, setFinePointer] = useState<boolean>(false);
  const radiusZRef = useRef<number>(DEFAULT_RADIUS_Z);
  const yScaleRef = useRef<number>(DEFAULT_Y_SCALE);
  const isInViewRef = useRef<boolean>(true);
  const prevStyleRef = useRef<
    Array<{
      zIndex: string;
      opacity: string;
      sheenOpacity: string;
    }>
  >([]);

  // Cámara 3D reactiva al cursor sobre contenedor con perspective: 1000px
  const pointerNormX = useMotionValue(0);
  const pointerNormY = useMotionValue(-0.08);
  const cameraRotateX = useSpring(
    useTransform(pointerNormY, [-0.5, 0.5], [11, -11]),
    { stiffness: 105, damping: 22 }
  );
  const cameraRotateY = useSpring(
    useTransform(pointerNormX, [-0.5, 0.5], [-13, 13]),
    { stiffness: 105, damping: 22 }
  );

  // Coordenadas para etiqueta flotante junto al cursor solo al posar sobre una pantalla
  const rawCursorX = useMotionValue(-200);
  const rawCursorY = useMotionValue(-200);
  const labelX = useSpring(rawCursorX, { stiffness: 360, damping: 28 });
  const labelY = useSpring(rawCursorY, { stiffness: 360, damping: 28 });

  // Portal Zoom-Through al salir del Hero hacia los proyectos (solo GPU: scale + opacity)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    scrollProgressRef.current = latest;
  });

  const coreOpacity = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    [1, 0.35, 0]
  );
  const coreScale = useTransform(scrollYProgress, [0, 1], [1, 2.1]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const syncPointer = () => setFinePointer(mq.matches);
    syncPointer();
    mq.addEventListener("change", syncPointer);

    const updateDimensions = () => {
      const vw = window.innerWidth;
      if (vw < 640) {
        radiusZRef.current = 124;
        yScaleRef.current = 0.48;
      } else if (vw < 1024) {
        radiusZRef.current = 245;
        yScaleRef.current = 0.78;
      } else {
        radiusZRef.current = 345;
        yScaleRef.current = 1;
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      mq.removeEventListener("change", syncPointer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (hoveredIndexRef.current !== null || isDraggingRef.current) {
        rawCursorX.set(e.clientX);
        rawCursorY.set(e.clientY);
      }

      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragLastXRef.current;
      dragLastXRef.current = e.clientX;
      totalDragDistanceRef.current += Math.abs(dx);
      if (totalDragDistanceRef.current > 4) {
        setIsDraggingOrbit(true);
      }

      const angleDelta = dx * 0.34;
      orbitAngleRef.current += angleDelta;
      angularVelocityRef.current = angleDelta;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDraggingOrbit(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [rawCursorX, rawCursorY]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        isInViewRef.current = entries[0] ? entries[0].isIntersecting : true;
      },
      { rootMargin: "150px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (document.hidden || !isInViewRef.current) return;
    const dt = Math.min(delta, 50) / 1000;
    const scrollP = scrollProgressRef.current;

    baseSpeedFactorRef.current +=
      (targetSpeedFactorRef.current - baseSpeedFactorRef.current) * 0.08;

    if (!isDraggingRef.current) {
      orbitAngleRef.current += angularVelocityRef.current;
      angularVelocityRef.current *= 0.95; // Inercia física suave
      if (Math.abs(angularVelocityRef.current) < 0.004) {
        angularVelocityRef.current = 0;
      }

      orbitAngleRef.current +=
        dt * (9.5 + scrollP * 16) * baseSpeedFactorRef.current;
    }

    const effectiveRadiusZ = radiusZRef.current;
    const activeHover = hoveredIndexRef.current;

    for (let i = 0; i < ORBIT_SCREENS.length; i++) {
      const screenEl = screenRefs.current[i];
      const sheenEl = sheenRefs.current[i];
      if (!screenEl) continue;

      const frame = computeScreenFrame(
        ORBIT_SCREENS[i],
        orbitAngleRef.current,
        effectiveRadiusZ,
        yScaleRef.current,
        activeHover === i,
        activeHover !== null && activeHover !== i,
        scrollP
      );

      let prev = prevStyleRef.current[i];
      if (!prev) {
        prev = {
          zIndex: "",
          opacity: "",
          sheenOpacity: "",
        };
        prevStyleRef.current[i] = prev;
      }

      screenEl.style.transform = frame.transform;

      const nextZIndex = String(frame.zIndex);
      if (prev.zIndex !== nextZIndex) {
        screenEl.style.zIndex = nextZIndex;
        prev.zIndex = nextZIndex;
      }

      const nextOpacity = frame.opacity.toFixed(3);
      if (prev.opacity !== nextOpacity) {
        screenEl.style.opacity = nextOpacity;
        prev.opacity = nextOpacity;
      }

      if (sheenEl) {
        sheenEl.style.transform = `translate3d(${frame.sheenTranslateX.toFixed(
          1
        )}%, 0, 0)`;
        const nextSheenOpacity = frame.sheenOpacity.toFixed(3);
        if (prev.sheenOpacity !== nextSheenOpacity) {
          sheenEl.style.opacity = nextSheenOpacity;
          prev.sheenOpacity = nextSheenOpacity;
        }
      }
    }
  });

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (hoveredIndexRef.current !== null || isDraggingRef.current) {
      rawCursorX.set(e.clientX);
      rawCursorY.set(e.clientY);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    pointerNormX.set(nx);
    pointerNormY.set(ny);
  };

  const handleStagePointerLeave = () => {
    pointerNormX.set(0);
    pointerNormY.set(-0.08);
    if (hoveredIndexRef.current !== null) {
      targetSpeedFactorRef.current = 1;
      hoveredIndexRef.current = null;
      setHoveredIndex(null);
    }
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragLastXRef.current = e.clientX;
    totalDragDistanceRef.current = 0;
    angularVelocityRef.current = 0;
  };

  const handleScreenEnter = (idx: number, e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      rawCursorX.set(e.clientX);
      rawCursorY.set(e.clientY);
    }
    targetSpeedFactorRef.current = 0.08;
    hoveredIndexRef.current = idx;
    setHoveredIndex(idx);
  };

  const handleScreenLeave = () => {
    targetSpeedFactorRef.current = 1;
    hoveredIndexRef.current = null;
    setHoveredIndex(null);
  };

  const handleScreenClick = (missionId: string) => {
    if (totalDragDistanceRef.current > 8) return;
    window.dispatchEvent(
      new CustomEvent("ellik:select-project", { detail: { id: missionId } })
    );
    const proyectos = document.getElementById("proyectos");
    if (proyectos) {
      const proyectosTop =
        proyectos.getBoundingClientRect().top + window.scrollY;
      const holdOffset = Math.min(
        200,
        Math.round(
          Math.max(0, proyectos.offsetHeight - window.innerHeight) * 0.15
        )
      );
      const targetY = proyectosTop + holdOffset;
      const lenis = window.__ellikLenis;
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.05 });
      } else {
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });
      }
    }
  };

  const hoveredMission =
    hoveredIndex !== null ? localizedMissions[hoveredIndex] ?? null : null;

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen overflow-x-clip flex flex-col justify-between pt-16 pb-24 lg:pt-20 lg:pb-14"
    >
      {/* Portal de Dispersión Radial 3D controlada por scroll */}
      <div className="my-auto w-full">
        {/* Escenario espacial 3D con perspective: 1000px */}
        <div
          ref={stageRef}
          data-cursor="orbit"
          onPointerMove={handleStagePointerMove}
          onPointerLeave={handleStagePointerLeave}
          onPointerDown={handleStagePointerDown}
          style={{ perspective: "1000px" }}
          className="relative flex w-full min-h-[420px] sm:min-h-[560px] md:min-h-[660px] items-center justify-center touch-pan-y select-none"
        >
          <motion.div
            style={{
              rotateX: cameraRotateX,
              rotateY: cameraRotateY,
            }}
            className="preserve-3d pointer-events-none relative flex h-[400px] sm:h-[540px] md:h-[640px] w-full items-center justify-center"
          >
            {/* A. EL SOL DEL SISTEMA: EMBLEMA 3D WEBGL EN PLANO CENTRAL (zIndex: 10, Z=0) */}
            <motion.div
              style={{
                z: 0,
                scale: coreScale,
                opacity: coreOpacity,
                zIndex: 10,
              }}
              className="pointer-events-none relative flex flex-col items-center justify-center text-center will-change-[transform,opacity]"
            >
              <EllikEmblem3D
                boost={isDraggingOrbit}
                scrollProgressRef={scrollProgressRef}
                className="-mb-6 sm:-mb-8 md:-mb-12"
              />

              <h1
                className="font-display font-semibold uppercase tracking-[0.14em] text-[#FFFFFF] pl-[0.14em] leading-[0.88] drop-shadow-[0_10px_40px_rgba(0,0,0,0.85)]"
                style={{ fontSize: "clamp(4.1rem, 11.5vw, 9.6rem)" }}
              >
                ELLIK
              </h1>

              <p className="mt-3 font-display font-normal not-italic text-lg sm:text-xl md:text-2xl tracking-[0.04em] text-[#F4F1EA]/85 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                {locale === "es"
                  ? "Tu negocio en órbita."
                  : "Your business in orbit."}
              </p>
            </motion.div>

            {/* B. LIENZOS 3D FLOTANTES SIN MARCO PESADO NI PIE DE TEXTO */}
            {ORBIT_SCREENS.map((screen, idx) => {
              const isHovered = hoveredIndex === idx;
              const localizedMission =
                localizedMissions[idx] ?? screen.mission;
              const initialFrame = computeScreenFrame(
                screen,
                INITIAL_ORBIT_ANGLE,
                DEFAULT_RADIUS_Z,
                DEFAULT_Y_SCALE,
                false,
                false,
                0
              );

              return (
                <div
                  key={screen.key}
                  ref={(el) => {
                    screenRefs.current[idx] = el;
                  }}
                  data-cursor="action"
                  role="button"
                  tabIndex={0}
                  onMouseEnter={(e) => handleScreenEnter(idx, e)}
                  onMouseLeave={handleScreenLeave}
                  onFocus={() => handleScreenEnter(idx)}
                  onBlur={handleScreenLeave}
                  onClick={() => handleScreenClick(screen.mission.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleScreenClick(screen.mission.id);
                    }
                  }}
                  aria-label={
                    locale === "es"
                      ? `${localizedMission.title} — Ir al proyecto`
                      : `${localizedMission.title} — View project`
                  }
                  style={{
                    transform: initialFrame.transform,
                    zIndex: initialFrame.zIndex,
                    opacity: initialFrame.opacity,
                  }}
                  className="pointer-events-auto absolute w-[195px] sm:w-[275px] md:w-[335px] lg:w-[375px] aspect-[16/10] cursor-pointer will-change-transform focus:outline-none"
                >
                  <div
                    className={`relative h-full w-full shadow-[0_24px_60px_rgba(0,0,0,0.82)] transition-[outline-color,transform] duration-300 ${
                      isHovered
                        ? "ring-1 ring-white/55 scale-[1.02]"
                        : "ring-1 ring-white/[0.10]"
                    }`}
                  >
                    <FloatingScreenSurface
                      mission={screen.mission}
                      sheenRef={(el) => {
                        sheenRefs.current[idx] = el;
                      }}
                      priority={idx < 2}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Etiqueta flotante junto al cursor solo al posar el mouse sobre una pantalla */}
      <AnimatePresence>
        {finePointer && hoveredMission && (
          <motion.div
            key={hoveredMission.id}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: labelX, y: labelY }}
            className="pointer-events-none fixed left-0 top-0 z-[110]"
          >
            <div className="ml-5 mt-5 flex items-center gap-2.5 border border-white/30 bg-[#050505]/[0.92] px-3 py-1.5 backdrop-blur-sm shadow-[0_12px_32px_rgba(0,0,0,0.8)]">
              <span className="font-sans font-medium tabular-nums text-[10px] tracking-[0.16em] text-[#71717A]">
                {hoveredMission.index}
              </span>
              <span className="font-sans font-medium text-[11px] tracking-[0.16em] uppercase text-[#FFFFFF] whitespace-nowrap">
                {hoveredMission.shortTitle}
              </span>
              <span className="font-sans font-medium text-[11px] text-[#F4F1EA]">↗</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* C. Cierre del Hero */}
      <div className="relative z-30 flex flex-col items-center text-center pt-2">
        <p className="font-sans text-sm md:text-base text-[#A1A1AA] max-w-lg text-center leading-relaxed">
          {locale === "es"
            ? "Diseño y desarrollo web a medida — Desde Córdoba para cualquier ciudad."
            : "Custom web design & development — From Córdoba to any city."}
        </p>

        <MagneticButton
          onClick={() => onOpenDrawer()}
          className="mt-7 inline-flex min-h-[44px] items-center border border-[rgba(255,255,255,0.28)] bg-transparent px-7 py-3.5 font-sans text-sm font-medium tracking-[0.02em] text-[#FFFFFF] transition-colors duration-200 hover:border-[#FFFFFF]"
        >
          {locale === "es"
            ? "Hablemos de tu web ↗"
            : "Let's talk about your site ↗"}
        </MagneticButton>
      </div>
    </section>
  );
}
