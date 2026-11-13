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
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
  type InvestmentPlan,
} from "@/data/ellikData";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

function OrbitDiagramIcon({ index }: { index: number }) {
  const activeCount = index + 1;
  return (
    <div className="relative h-12 w-12 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={
            activeCount >= 3
              ? "rgba(244,241,234,0.45)"
              : "rgba(255,255,255,0.12)"
          }
          strokeWidth="1"
        />
        <circle
          cx="24"
          cy="24"
          r="13"
          fill="none"
          stroke={
            activeCount >= 2
              ? "rgba(244,241,234,0.55)"
              : "rgba(255,255,255,0.12)"
          }
          strokeWidth="1"
        />
        <circle
          cx="24"
          cy="24"
          r="6"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1"
        />
        <rect x="22.5" y="22.5" width="3" height="3" fill="#F4F1EA" />
      </svg>

      {/* Satélite animado en la órbita activa más externa */}
      <motion.svg
        viewBox="0 0 48 48"
        animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
        transition={{
          duration: 12 + index * 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <rect
          x="22.5"
          y={activeCount === 1 ? "16.5" : activeCount === 2 ? "9.5" : "2.5"}
          width="3"
          height="3"
          fill="#FFFFFF"
        />
      </motion.svg>
    </div>
  );
}

function OrbitPlan3DCard({
  plan,
  index,
  isInView,
  onOpenDrawer,
}: {
  plan: InvestmentPlan;
  index: number;
  isInView: boolean;
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}) {
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const spotX = useMotionValue(-300);
  const spotY = useMotionValue(-300);

  const rotateX = useSpring(useTransform(normY, [0, 1], [5.5, -5.5]), {
    stiffness: 170,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(normX, [0, 1], [-5.5, 5.5]), {
    stiffness: 170,
    damping: 22,
  });

  const spotlight = useMotionTemplate`radial-gradient(300px circle at ${spotX}px ${spotY}px, rgba(244, 241, 234, 0.08), transparent 72%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
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
    spotX.set(-300);
    spotY.set(-300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: -14 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{
        duration: 0.58,
        delay: 0.14 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: "1000px", transformOrigin: "bottom center" }}
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
        <motion.div
          aria-hidden="true"
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 z-0"
        />

        <div
          style={{ transform: "translateZ(20px)" }}
          className="relative z-10"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-muted)]">
              {plan.code}
            </span>
            <OrbitDiagramIcon index={index} />
          </div>

          <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)]">
            {plan.title}
          </h3>

          <p className="editorial-body mt-4 text-[var(--text-secondary)]">
            {plan.description}
          </p>

          <ul className="mt-7 space-y-3 border-t border-[var(--border-hairline)] pt-6">
            {plan.scopeItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
              >
                <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{ transform: "translateZ(14px)" }}
          className="relative z-10 mt-10 pt-6 border-t border-[var(--border-hairline)]"
        >
          <button
            type="button"
            onClick={() =>
              onOpenDrawer({
                rubro: plan.defaultRubro,
                plan: plan.fullTitle,
              })
            }
            className="group font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] hover:text-[var(--accent-starlight)] transition-colors inline-flex items-center gap-2 py-1"
          >
            <span>CONSULTAR ALCANCE</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="inversion"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <div ref={sectionRef}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="telemetry-label text-xs text-[var(--text-muted)]"
        >
          05 // MODALIDADES &amp; AUTORIDAD
        </motion.p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.58,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="heading-section lg:col-span-8 text-[var(--text-primary)]"
          >
            CÓDIGO A MEDIDA, VELOCIDAD DE EJECUCIÓN Y VISIÓN COMERCIAL —{" "}
            <span className="serif-accent">SIN INTERMEDIARIOS.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.52,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="editorial-body lg:col-span-4 text-[var(--text-secondary)]"
          >
            Cada web se construye desde cero sin plantillas lentas ni costos
            ocultos por transacción. Operamos de forma remota para cualquier
            ciudad con soporte técnico directo de desarrollador a dueño.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 border border-[var(--border-hairline)] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-hairline)]">
          {INVESTMENT_PLANS.map((plan, index) => (
            <OrbitPlan3DCard
              key={plan.code}
              plan={plan}
              index={index}
              isInView={isInView}
              onOpenDrawer={onOpenDrawer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
