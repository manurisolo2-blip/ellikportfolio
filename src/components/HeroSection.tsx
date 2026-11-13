"use client";

import React, { useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";
import { ELLIK_CONFIG, MISSIONS, type BusinessCategory, type Mission } from "@/data/ellikData";

interface HeroSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

interface OrbitSlot {
  slotIndex: number;
  baseAngle: number;
  navCode: string;
  mission: Mission;
  missionIndex: number;
}

const SLOT_NAV_CODES = [
  "01 // FOOD",
  "02 // FOOD",
  "03 // WEAR",
  "04 // GOV",
] as const;

// 8 slots cada 45° alternando las 4 misiones reales en dos hemisferios opuestos
const ORBIT_SLOTS: OrbitSlot[] = Array.from({ length: 8 }, (_, idx) => {
  const missionIndex = idx % 4;
  return {
    slotIndex: idx,
    baseAngle: (idx * Math.PI) / 4,
    navCode: SLOT_NAV_CODES[missionIndex],
    mission: MISSIONS[missionIndex],
    missionIndex,
  };
});

function OrbitCardPreviewBody({ mission }: { mission: Mission }) {
  if (mission.previewMode === "gastronomy-order") {
    return (
      <div className="flex flex-1 flex-col justify-between p-2.5 md:p-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between border border-white/15 bg-white/[0.03] px-2 py-1.5">
            <span className="font-mono text-[8px] md:text-[9px] text-white/90 truncate">
              DOBLE SMASH
            </span>
            <span className="font-mono text-[8px] md:text-[9px] text-[#F4F1EA]">
              $11.4K
            </span>
          </div>
          <div className="flex items-center justify-between border border-white/10 px-2 py-1.5">
            <span className="font-mono text-[8px] md:text-[9px] text-[#8A8A93] truncate">
              PAPAS BACON
            </span>
            <span className="font-mono text-[8px] md:text-[9px] text-[#8A8A93]">
              $5.2K
            </span>
          </div>
          <div className="hidden md:flex items-center justify-between border border-white/10 px-2 py-1.5">
            <span className="font-mono text-[9px] text-[#8A8A93] truncate">
              COMBO NOCHE X2
            </span>
            <span className="font-mono text-[9px] text-[#8A8A93]">$24.8K</span>
          </div>
        </div>

        <div className="mt-2 border border-white/30 bg-white text-[#050505] px-2 py-1 text-center font-mono text-[8px] md:text-[9px] font-medium tracking-[0.12em]">
          PEDIDO WHATSAPP →
        </div>
      </div>
    );
  }

  if (mission.previewMode === "gastronomy-menu") {
    return (
      <div className="flex flex-1 flex-col justify-between p-2.5 md:p-3">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-mono text-[8px] text-[#F4F1EA] tracking-[0.12em]">
              CARTA EXPRESS
            </span>
            <span className="font-mono text-[7px] border border-white/25 px-1 py-0.5 text-white">
              0% FEE
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="border border-white/15 bg-white/[0.04] p-1.5">
              <div className="h-5 md:h-7 w-full bg-white/10 mb-1" />
              <span className="block font-mono text-[7px] md:text-[8px] text-white truncate">
                NAPOLETANA
              </span>
            </div>
            <div className="border border-white/15 bg-white/[0.04] p-1.5">
              <div className="h-5 md:h-7 w-full bg-white/10 mb-1" />
              <span className="block font-mono text-[7px] md:text-[8px] text-white truncate">
                FUGAZZETA
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-white/10 pt-1.5 flex items-center justify-between font-mono text-[8px] text-[#8A8A93]">
          <span>BIO IG READY</span>
          <span className="text-[#F4F1EA]">4G &lt;1S</span>
        </div>
      </div>
    );
  }

  if (mission.previewMode === "apparel-catalog") {
    return (
      <div className="flex flex-1 flex-col justify-between p-2.5 md:p-3">
        <div>
          <div className="border border-white/15 bg-white/[0.03] p-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] md:text-[9px] text-white truncate">
                BUZO 420G
              </span>
              <span className="font-mono text-[7px] text-[#F4F1EA]">STOCK</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {["S", "M", "L", "XL"].map((size, i) => (
                <span
                  key={size}
                  className={`border py-0.5 text-center font-mono text-[8px] ${
                    i === 1
                      ? "border-white bg-white text-[#050505] font-bold"
                      : "border-white/20 text-[#8A8A93]"
                  }`}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-1.5 hidden md:flex items-center justify-between border border-white/10 px-2 py-1">
            <span className="font-mono text-[8px] text-[#8A8A93]">
              CARGO RIPSTOP
            </span>
            <span className="font-mono text-[8px] text-[#F4F1EA]">40/42</span>
          </div>
        </div>

        <div className="mt-2 border border-white/25 px-2 py-1 text-center font-mono text-[8px] text-white tracking-[0.12em]">
          CONSULTAR TALLE
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between p-2.5 md:p-3">
      <div className="space-y-1.5">
        <div className="border-l-2 border-[#F4F1EA] bg-white/[0.04] px-2 py-1.5">
          <span className="block font-mono text-[8px] md:text-[9px] text-white truncate">
            GUÍA DE TRÁMITES
          </span>
          <span className="block font-mono text-[7px] text-[#8A8A93]">
            TURNOS ONLINE 24/7
          </span>
        </div>
        <div className="border border-white/10 px-2 py-1.5">
          <span className="block font-mono text-[8px] md:text-[9px] text-[#8A8A93] truncate">
            BOLETÍN OFICIAL
          </span>
        </div>
        <div className="hidden md:block border border-white/10 px-2 py-1.5">
          <span className="block font-mono text-[8px] text-[#8A8A93] truncate">
            ATENCIÓN VECINAL
          </span>
        </div>
      </div>

      <div className="mt-2 border-t border-white/10 pt-1.5 flex items-center justify-between font-mono text-[8px] text-[#8A8A93]">
        <span>WCAG AA</span>
        <span className="text-[#F4F1EA]">ACTIVO</span>
      </div>
    </div>
  );
}

export function HeroSection({ onOpenDrawer }: HeroSectionProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const angleRef = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1);
  const targetSpeedRef = useRef<number>(1);
  const hoveredSlotRef = useRef<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  useAnimationFrame((_, delta) => {
    const stageWidth = stageRef.current?.clientWidth ?? window.innerWidth;
    const isDesktop = window.innerWidth >= 768;

    // Radio horizontal y vertical de la elipse inclinada (-10deg)
    const radiusX = isDesktop
      ? Math.min(420, Math.max(260, stageWidth * 0.37))
      : 165;
    const radiusY = isDesktop ? radiusX * 0.22 : 42;
    const tiltOffset = isDesktop ? -radiusX * 0.176 : -29; // tan(-10deg) ≈ -0.1763

    // Desaceleración suave (lerp de velocidad 1x -> 0.15x)
    speedMultiplierRef.current +=
      (targetSpeedRef.current - speedMultiplierRef.current) * 0.08;

    const angularStep =
      (Math.min(delta, 50) / 1000) * 0.28 * speedMultiplierRef.current;
    angleRef.current += angularStep;

    for (let i = 0; i < ORBIT_SLOTS.length; i++) {
      const cardEl = cardRefs.current[i];
      if (!cardEl) continue;

      const slot = ORBIT_SLOTS[i];
      const theta = slot.baseAngle + angleRef.current;

      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const x = cosT * radiusX;
      const z = sinT; // -1 (atrás) a +1 (adelante)
      const y = sinT * radiusY + cosT * tiltOffset;
      const rotateY = -cosT * 28;
      const skewY = -cosT * 3.5;

      const isFront = z >= 0;
      const isHovered = hoveredSlotRef.current === i;

      let scale: number;
      let opacity: number;
      let brightness: number;
      let zIndex: number;

      if (isFront) {
        scale = 0.92 + z * 0.14; // 0.92 a 1.06
        opacity = 0.85 + z * 0.15; // 0.85 a 1.0
        brightness = 1;
        zIndex = isHovered ? 24 : 20;
      } else {
        scale = 0.88 + z * 0.16; // 0.72 a 0.88
        opacity = 0.45 + z * 0.23; // 0.22 a 0.45
        brightness = 0.6;
        zIndex = isHovered ? 8 : 5;
      }

      cardEl.style.zIndex = String(zIndex);
      cardEl.style.opacity = opacity.toFixed(3);
      cardEl.style.filter = `brightness(${brightness})`;
      cardEl.style.transform = `translate3d(calc(-50% + ${x.toFixed(
        2
      )}px), calc(-50% + ${y.toFixed(
        2
      )}px), 0px) perspective(1200px) rotateY(${rotateY.toFixed(
        2
      )}deg) skewY(${skewY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    }
  });

  const handleCardEnter = (slotIndex: number) => {
    targetSpeedRef.current = 0.15;
    hoveredSlotRef.current = slotIndex;
    setHoveredSlot(slotIndex);
  };

  const handleCardLeave = () => {
    targetSpeedRef.current = 1;
    hoveredSlotRef.current = null;
    setHoveredSlot(null);
  };

  const scrollToMission = (missionIndex: number) => {
    const target =
      document.getElementById(`mision-0${missionIndex + 1}`) ??
      document.getElementById("misiones");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToMissionsSection = () => {
    const target = document.getElementById("misiones");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="orbita"
      className="relative min-h-screen overflow-x-hidden flex flex-col justify-between pt-24 pb-12 lg:pt-28 lg:pb-12"
    >
      {/* Barra superior de telemetría */}
      <div className="relative z-25 flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
        <p className="telemetry-label text-[10px] sm:text-[11px] text-[var(--text-secondary)]">
          ESTUDIO WEB // DISEÑO &amp; INGENIERÍA DE CONVERSIÓN
        </p>
        <span className="hidden sm:inline-block telemetry-label text-[11px] text-[var(--text-muted)]">
          01 // ÓRBITA
        </span>
      </div>

      {/* Escenario Orbital 3D */}
      <div
        ref={stageRef}
        className="relative mx-auto my-auto flex w-full min-h-[380px] sm:min-h-[430px] md:min-h-[480px] items-center justify-center py-6"
      >
        {/* Trazo visual tenue de la órbita elíptica inclinada */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 960 320"
            className="w-[360px] md:w-[880px] overflow-visible opacity-60"
          >
            <ellipse
              cx="480"
              cy="160"
              rx="420"
              ry="92"
              transform="rotate(-10 480 160)"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </svg>
        </div>

        {/* 1. EL NÚCLEO GRAVITACIONAL (LA ESTRELLA ELLIK) — z-index: 10 */}
        <div className="pointer-events-none relative z-10 flex flex-col items-center justify-center text-center px-4">
          {/* Halo radial muy sutil + Estrella de 4 puntas + Anillos finos cruzados */}
          <div className="relative flex h-36 w-36 md:h-48 md:w-48 items-center justify-center">
            <div
              className="animate-pulse-star absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)",
              }}
            />

            {/* Dos anillos orbitales finos cruzándose en ángulo */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <ellipse
                cx="100"
                cy="100"
                rx="88"
                ry="34"
                transform="rotate(-24 100 100)"
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
              <ellipse
                cx="100"
                cy="100"
                rx="88"
                ry="34"
                transform="rotate(28 100 100)"
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
            </svg>

            {/* Emblema luminoso: Estrella de 4 puntas afiladas en #FFFFFF */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-pulse-star relative z-10 h-14 w-14 md:h-16 md:w-16"
            >
              <path
                d="M32 4 C34.2 24.5 39.5 29.8 60 32 C39.5 34.2 34.2 39.5 32 60 C29.8 39.5 24.5 34.2 4 32 C24.5 29.8 29.8 24.5 32 4 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Tipografía Central sobre/junto a la estrella */}
          <h1
            className="mt-1 font-display font-bold uppercase tracking-[-0.03em] leading-[0.95] text-[#FFFFFF]"
            style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
          >
            ELLIK
          </h1>
          <p className="mt-2 font-serif italic font-normal text-xl sm:text-2xl md:text-3xl tracking-[-0.015em] text-[#F4F1EA]">
            TU NEGOCIO EN ÓRBITA.
          </p>
        </div>

        {/* 2. CINTURÓN ORBITAL 3D DE 8 PÁGINAS WEB (z-index dinámico: 5 atrás / 20 adelante) */}
        {ORBIT_SLOTS.map((slot) => {
          const isFocused = hoveredSlot === slot.slotIndex;
          return (
            <div
              key={slot.slotIndex}
              ref={(el) => {
                cardRefs.current[slot.slotIndex] = el;
              }}
              onMouseEnter={() => handleCardEnter(slot.slotIndex)}
              onMouseLeave={handleCardLeave}
              onPointerDown={() => handleCardEnter(slot.slotIndex)}
              onClick={() => scrollToMission(slot.missionIndex)}
              role="button"
              tabIndex={0}
              onFocus={() => handleCardEnter(slot.slotIndex)}
              onBlur={handleCardLeave}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToMission(slot.missionIndex);
                }
              }}
              aria-label={`${slot.mission.title} — Ir a detalle de misión`}
              style={{
                left: "50%",
                top: "50%",
                willChange: "transform, opacity",
              }}
              className={`absolute flex flex-col w-[155px] h-[195px] md:w-[220px] md:h-[260px] bg-[#0B0B0D] cursor-pointer select-none transition-colors duration-200 border ${
                isFocused
                  ? "border-[#FFFFFF]"
                  : "border-[rgba(255,255,255,0.22)]"
              }`}
            >
              {/* Barra superior estilo navegador minimalista */}
              <div className="h-5 shrink-0 border-b border-white/15 px-2 flex items-center justify-between bg-[#08080A]">
                <span className="font-mono text-[8px] tracking-[0.14em] uppercase text-[#FFFFFF]">
                  {slot.navCode}
                </span>
                <span className="font-mono text-[7px] tracking-[0.14em] text-[#8A8A93]">
                  ● LIVE
                </span>
              </div>

              {/* Previsualización visual estilizada por rubro */}
              <OrbitCardPreviewBody mission={slot.mission} />

              {/* Pie de tarjeta con título breve y enlace PROBAR */}
              <div className="shrink-0 border-t border-white/15 px-2.5 py-1.5 flex items-center justify-between gap-2 bg-[#08080A]">
                <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-[#8A8A93] truncate">
                  {slot.mission.title}
                </span>
                <a
                  href={slot.mission.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[8px] tracking-[0.14em] uppercase text-[#FFFFFF] hover:text-[#F4F1EA] shrink-0"
                >
                  PROBAR ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BAJADA COMERCIAL Y CTA INFERIOR DEL HERO (z-index: 25) */}
      <div className="relative z-[25] flex flex-col items-center text-center pt-4">
        <p className="font-mono text-xs md:text-sm text-[#8A8A93] max-w-lg text-center uppercase tracking-[0.06em] leading-[1.65]">
          PÁGINAS WEB DE ALTA CONVERSIÓN PARA COMERCIOS Y MARCAS QUE QUIEREN
          RECIBIR PEDIDOS SIN FRICCIÓN.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onOpenDrawer()}
            className="bg-[#FFFFFF] text-[#050505] font-mono text-xs tracking-[0.16em] uppercase px-6 py-3.5 transition-colors duration-200 hover:bg-[#F4F1EA]"
          >
            AGENDAR LLAMADA DE 10 MIN
          </button>

          <button
            type="button"
            onClick={scrollToMissionsSection}
            className="border border-white/25 text-[#FFFFFF] font-mono text-xs tracking-[0.16em] uppercase px-6 py-3.5 transition-colors duration-200 hover:border-[#FFFFFF]"
          >
            EXPLORAR MISIONES ↓
          </button>
        </div>

        <div className="mt-8 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-[var(--border-hairline)] text-left">
          <span className="telemetry-label text-[10px] sm:text-[11px] text-[var(--text-muted)]">
            {ELLIK_CONFIG.coordinates}
          </span>
          <span className="telemetry-label text-[10px] sm:text-[11px] text-[var(--text-muted)]">
            MOBILE-FIRST // WHATSAPP CHECKOUT // 4G READY
          </span>
        </div>
      </div>
    </section>
  );
}
