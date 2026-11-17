"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
} from "@/data/ellikData";
import { AnimatedHeading, HairlineRule } from "./AnimatedHeading";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

const PLAN_TITLE_CASE_MAP: Record<string, string> = {
  "01 — CARTA & LANDING": "01 — Carta & Landing",
  "02 — CATÁLOGO COMERCIAL": "02 — Catálogo Comercial",
  "03 — DESARROLLO A MEDIDA": "03 — Desarrollo a Medida",
};

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section id="modalidades" className="relative py-24 lg:py-36">
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div
        ref={sectionRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start"
      >
        {/* Izquierda (5/12): Titular tonal en Clash Display */}
        <div
          className="lg:col-span-5 lg:sticky lg:top-32"
          style={{ perspective: "1000px" }}
        >
          <AnimatedHeading
            prefix="Código a medida, velocidad de ejecución y visión comercial"
            accent="— sin intermediarios."
            toneVariant="silver"
            className="text-[clamp(2rem,3.8vw,3.25rem)] font-medium leading-[1.04] tracking-[-0.025em]"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 font-sans text-[15px] leading-relaxed text-[#8A8A93] max-w-sm"
          >
            Cada web se construye desde cero sin plantillas lentas ni costos
            ocultos por transacción. Soporte técnico directo de desarrollador a
            dueño.
          </motion.p>
        </div>

        {/* Derecha (7/12): Paneles horizontales apilados del ledger comercial */}
        <div className="lg:col-span-7 border-t border-white/[0.14]">
          {INVESTMENT_PLANS.map((plan, index) => (
            <motion.article
              key={plan.code}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: 0.14 + index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group border-b border-white/[0.14] py-8 lg:py-10 px-2 hover:bg-white/[0.015] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="max-w-lg">
                <h3 className="font-display text-2xl font-medium tracking-[-0.02em] leading-[1.1] text-white">
                  {PLAN_TITLE_CASE_MAP[plan.title] ?? plan.title}
                </h3>

                <p className="mt-2.5 font-sans text-[15px] leading-relaxed text-[#8A8A93] group-hover:text-[#D4D4D8] transition-colors">
                  {plan.description}
                </p>
              </div>

              <button
                type="button"
                data-cursor="action"
                onClick={() =>
                  onOpenDrawer({
                    rubro: plan.defaultRubro,
                    plan: plan.fullTitle,
                  })
                }
                className="group/btn shrink-0 inline-flex min-h-[44px] items-center gap-2 border border-white/15 hover:border-white/50 px-4 py-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[#F4F1EA] hover:text-white transition-colors self-start sm:self-center"
              >
                <span>CONSULTAR ALCANCE</span>
                <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
                  ↗
                </span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
