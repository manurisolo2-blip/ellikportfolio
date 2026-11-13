"use client";

import React, { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Monitor, Smartphone } from "lucide-react";
import { MISSIONS, type Mission } from "@/data/ellikData";

function MissionDevicePreview({ mission }: { mission: Mission }) {
  const [viewportMode, setViewportMode] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

  const selectedItem =
    mission.previewItems[selectedItemIndex] ?? mission.previewItems[0];

  // Campo 3D interactivo al cursor
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const spotX = useMotionValue(-350);
  const spotY = useMotionValue(-350);

  const rotateX = useSpring(useTransform(normY, [0, 1], [5, -5]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(normX, [0, 1], [-5, 5]), {
    stiffness: 160,
    damping: 22,
  });

  const specularHighlight = useMotionTemplate`radial-gradient(380px circle at ${spotX}px ${spotY}px, rgba(255, 255, 255, 0.06), transparent 72%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    normX.set(x / Math.max(rect.width, 1));
    normY.set(y / Math.max(rect.height, 1));
    spotX.set(x);
    spotY.set(y);
  };

  const handlePointerLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    spotX.set(-350);
    spotY.set(-350);
  };

  return (
    <div style={{ perspective: "1200px" }}>
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative border border-[var(--border-hairline)] bg-[var(--bg-elevated)] flex flex-col transition-colors duration-200 hover:border-[var(--border-active)]"
      >
        {/* Reflejo especular dinámico 3D */}
        <motion.div
          aria-hidden="true"
          style={{ background: specularHighlight }}
          className="pointer-events-none absolute inset-0 z-20"
        />

        {/* Barra superior de navegador / dominio simulado */}
        <div
          style={{ transform: "translateZ(12px)" }}
          className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] px-4 py-3 bg-[#08080A]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex items-center gap-1.5 shrink-0"
              aria-hidden="true"
            >
              <span className="h-2 w-2 border border-white/25 block" />
              <span className="h-2 w-2 border border-white/25 block" />
              <span className="h-2 w-2 bg-white/60 block" />
            </div>
            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] truncate">
              https://{mission.domainDisplay}
            </span>
          </div>

          {/* Toggle rápido Mobile / Web */}
          <div className="flex items-center border border-[var(--border-hairline)] shrink-0">
            <button
              type="button"
              onClick={() => setViewportMode("mobile")}
              aria-label={`Vista móvil de ${mission.title}`}
              className={`px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase flex items-center gap-1.5 transition-colors ${
                viewportMode === "mobile"
                  ? "bg-[var(--text-primary)] text-[#050505]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Smartphone className="h-3 w-3" />
              <span className="hidden sm:inline">MÓVIL</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("desktop")}
              aria-label={`Vista escritorio de ${mission.title}`}
              className={`px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase flex items-center gap-1.5 border-l border-[var(--border-hairline)] transition-colors ${
                viewportMode === "desktop"
                  ? "bg-[var(--text-primary)] text-[#050505]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden sm:inline">WEB</span>
            </button>
          </div>
        </div>

        {/* Área de vista previa interactiva con profundidad Z */}
        <div
          style={{ transformStyle: "preserve-3d" }}
          className="relative z-10 p-5 sm:p-7 flex justify-center bg-[#060608]"
        >
          <motion.div
            layout
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              transform: "translateZ(24px)",
              transformStyle: "preserve-3d",
            }}
            className={`w-full border border-[var(--border-hairline)] bg-[#0B0B0D] ${
              viewportMode === "mobile" ? "max-w-[330px]" : "max-w-full"
            }`}
          >
            {/* Cabecera interna del proyecto simulado */}
            <div className="border-b border-[var(--border-hairline)] px-4 py-3.5 flex items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--text-muted)]">
                  {mission.previewSubline}
                </p>
                <p className="font-display text-sm sm:text-base font-bold tracking-[-0.02em] text-[var(--text-primary)] mt-1">
                  {mission.previewHeadline}
                </p>
              </div>
              <motion.span
                style={{ transform: "translateZ(12px)" }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[var(--border-active)] px-2 py-1 text-[var(--accent-starlight)] shrink-0 bg-[#08080A]"
              >
                ● LIVE
              </motion.span>
            </div>

            {/* Lista interactiva de ítems según el rubro */}
            <div className="divide-y divide-[var(--border-hairline)]">
              {mission.previewItems.map((item, idx) => {
                const isSelected = idx === selectedItemIndex;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedItemIndex(idx)}
                    className={`relative w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
                      isSelected
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.025]"
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId={`active-indicator-${mission.code}`}
                        transition={{
                          type: "spring",
                          stiffness: 360,
                          damping: 30,
                        }}
                        className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent-starlight)]"
                      />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[var(--text-primary)]"
                              : "border border-[var(--text-muted)]"
                          }`}
                        />
                        <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-[var(--text-primary)] truncate">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 pl-3.5">
                        {item.detail}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] text-[var(--accent-starlight)] block">
                        {item.priceOrStatus}
                      </span>
                      {item.tag && (
                        <span className="font-mono text-[9px] tracking-[0.14em] text-[var(--text-muted)] uppercase">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Barra inferior de acción simulada */}
            <div className="border-t border-[var(--border-hairline)] px-4 py-3 bg-[#09090B] flex items-center justify-between gap-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedItem.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text-muted)] truncate"
                >
                  SELECCIÓN: {selectedItem.name}
                </motion.span>
              </AnimatePresence>
              <a
                href={mission.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-primary)] hover:text-[var(--accent-starlight)] shrink-0 underline underline-offset-4"
              >
                {mission.previewActionLabel}
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function MissionsSection() {
  return (
    <section
      id="misiones"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="telemetry-label text-xs text-[var(--text-muted)]">
          04 // BITÁCORA DE MISIONES (PROYECTOS EN VIVO)
        </p>

        <h2 className="heading-section mt-6 max-w-4xl text-[var(--text-primary)]">
          DESARROLLOS REALES PROBANDO RESULTADOS EN{" "}
          <span className="serif-accent">PRODUCCIÓN.</span>
        </h2>

        <div className="mt-16 border-t border-[var(--border-hairline)]">
          {MISSIONS.map((mission, idx) => (
            <motion.article
              key={mission.code}
              id={`mision-0${idx + 1}`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="border-b border-[var(--border-hairline)] py-14 lg:py-20 grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-12 items-start"
            >
              {/* Columna izquierda: información comercial */}
              <div className="xl:col-span-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] bg-white/[0.06] border border-[var(--border-hairline)] px-3 py-1">
                      {mission.code}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--text-muted)]">
                      {mission.category}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-2xl sm:text-3xl font-bold uppercase tracking-[-0.02em] leading-[1.05] text-[var(--text-primary)]">
                    {mission.title}
                  </h3>

                  <p className="editorial-body mt-5 text-[var(--text-secondary)]">
                    {mission.problemSolved}
                  </p>

                  {/* Badge monospace con métrica clave */}
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center border border-[var(--border-active)] px-3.5 py-2 font-mono text-xs tracking-[0.14em] uppercase text-[var(--accent-starlight)]">
                      ■ {mission.metric}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--text-muted)]">
                      {mission.accentTag}
                    </span>
                  </div>
                </div>

                <div className="mt-9 pt-6 border-t border-[var(--border-hairline)]">
                  <a
                    href={mission.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden inline-flex items-center gap-3 border border-[rgba(255,255,255,0.25)] px-6 py-3.5 font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--text-primary)] hover:text-[#050505] hover:border-[var(--text-primary)]"
                  >
                    <span>PROBAR PÁGINA EN VIVO</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              {/* Columna derecha: Mockup interactivo 3D en modo oscuro */}
              <div className="xl:col-span-7">
                <MissionDevicePreview mission={mission} />
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
