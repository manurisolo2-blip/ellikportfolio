"use client";

import React, { useRef } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { SYSTEM_PILLARS, type SystemPillar } from "@/data/ellikData";

function PillarTelemetryVisualizer({ code }: { code: string }) {
  if (code === "SYS.01") {
    return (
      <div className="mt-7 border border-[var(--border-hairline)] bg-[#060608] p-3.5">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)]">
          <span>CARGA 4G</span>
          <span className="text-[var(--accent-starlight)]">0.42s LCP</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-white/10 overflow-hidden">
          <motion.div
            animate={{ scaleX: [0.12, 1, 1, 0.12] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              times: [0, 0.35, 0.8, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "left" }}
            className="h-full w-full bg-[var(--accent-starlight)]"
          />
        </div>
      </div>
    );
  }

  if (code === "SYS.02") {
    const steps = ["01 ITEM", "02 VARIANTES", "03 WHATSAPP"];
    return (
      <div className="mt-7 border border-[var(--border-hairline)] bg-[#060608] p-3.5">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)]">
          <span>FLUJO AUTÓNOMO</span>
          <span className="text-[var(--accent-starlight)]">PAYLOAD OK</span>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              animate={{
                borderColor: [
                  "rgba(255,255,255,0.12)",
                  "rgba(244,241,234,0.65)",
                  "rgba(255,255,255,0.12)",
                ],
                backgroundColor: [
                  "rgba(255,255,255,0.02)",
                  "rgba(244,241,234,0.12)",
                  "rgba(255,255,255,0.02)",
                ],
              }}
              transition={{
                duration: 2.4,
                delay: i * 0.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="border border-white/10 px-1.5 py-1 text-center font-mono text-[9px] tracking-[0.1em] text-[var(--text-secondary)]"
            >
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7 border border-[var(--border-hairline)] bg-[#060608] p-3.5">
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)]">
        <span>MARGEN RETENIDO</span>
        <span className="text-[var(--accent-starlight)]">0% COMISIÓN</span>
      </div>
      <div className="mt-2.5 space-y-1.5 font-mono text-[9px] tracking-[0.1em]">
        <div className="flex items-center gap-2">
          <span className="w-14 text-[var(--text-primary)]">ELLIK</span>
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 flex-1 bg-[var(--accent-starlight)]"
          />
          <span className="text-[var(--accent-starlight)]">100%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 text-[var(--text-muted)]">APPS</span>
          <div className="h-1.5 flex-1 bg-white/10">
            <div className="h-full w-[68%] bg-white/25" />
          </div>
          <span className="text-[var(--text-muted)]">-32%</span>
        </div>
      </div>
    </div>
  );
}

function Pillar3DCard({
  pillar,
  index,
  isInView,
}: {
  pillar: SystemPillar;
  index: number;
  isInView: boolean;
}) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const pixelX = useMotionValue(-300);
  const pixelY = useMotionValue(-300);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), {
    stiffness: 180,
    damping: 22,
  });

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${pixelX}px ${pixelY}px, rgba(244, 241, 234, 0.085), transparent 70%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / Math.max(rect.width, 1));
    mouseY.set(y / Math.max(rect.height, 1));
    pixelX.set(x);
    pixelY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    pixelX.set(-300);
    pixelY.set(-300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: 0.14 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: "1000px" }}
      className="h-full"
    >
      <motion.article
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative flex h-full flex-col justify-between p-8 lg:p-10 bg-[var(--bg-elevated)] transition-colors duration-200 hover:bg-[#0E0E11]"
      >
        {/* Spotlight radial que sigue al cursor */}
        <motion.div
          aria-hidden="true"
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 z-0"
        />

        <div
          style={{ transform: "translateZ(20px)" }}
          className="relative z-10"
        >
          <p className="font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-muted)]">
            {pillar.code} // {pillar.title}
          </p>

          <h3 className="mt-5 font-display text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)]">
            {pillar.title}
          </h3>

          <p className="editorial-body mt-4 text-[var(--text-secondary)]">
            {pillar.description}
          </p>

          <PillarTelemetryVisualizer code={pillar.code} />
        </div>

        <div
          style={{ transform: "translateZ(14px)" }}
          className="relative z-10 mt-8 pt-5 border-t border-[var(--border-hairline)]"
        >
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--text-muted)]">
            {pillar.telemetry}
          </span>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="sistema"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <div ref={sectionRef}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="telemetry-label text-xs text-[var(--text-muted)]"
        >
          03 // ARQUITECTURA ELLIK
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.58, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="heading-section mt-6 max-w-5xl text-[var(--text-primary)]"
        >
          PÁGINAS RÁPIDAS PENSADAS PARA QUE EL CLIENTE ELIJA SOLO Y TE LLEGUE EL
          PEDIDO <span className="serif-accent">ARMADO.</span>
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 border border-[var(--border-hairline)] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-hairline)]">
          {SYSTEM_PILLARS.map((pillar, index) => (
            <Pillar3DCard
              key={pillar.code}
              pillar={pillar}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
