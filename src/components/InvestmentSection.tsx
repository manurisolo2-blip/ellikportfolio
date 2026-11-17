"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
} from "@/data/ellikData";
import { AnimatedHeading } from "./AnimatedHeading";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

const PLAN_DISPLAY_TITLES: Record<string, string> = {
  "01 — CARTA & LANDING": "Carta & Landing Express",
  "02 — CATÁLOGO COMERCIAL": "Catálogo E-Commerce",
  "03 — DESARROLLO A MEDIDA": "Desarrollo a Medida",
};

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section id="modalidades" className="relative py-28 lg:py-40">
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

        {/* Derecha (7/12): Paneles horizontales brutalistas con inversión blanco/negro en hover */}
        <div className="lg:col-span-7 border-t border-white/[0.14]">
          {INVESTMENT_PLANS.map((plan, index) => {
            const cleanTitle = PLAN_DISPLAY_TITLES[plan.title] ?? plan.title;
            return (
              <motion.article
                key={plan.code}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: 0.14 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group border-b border-white/[0.14] py-8 lg:py-10 px-4 -mx-4 lg:px-6 lg:-mx-6 text-white hover:bg-[#F4F1EA] hover:text-[#050505] transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="max-w-lg">
                  <h3 className="font-display text-2xl font-medium tracking-[-0.02em] leading-[1.1] text-white group-hover:text-[#050505] transition-colors duration-300">
                    {cleanTitle}
                  </h3>

                  <p className="mt-2.5 font-sans text-[15px] leading-relaxed text-[#8A8A93] group-hover:text-[#050505]/80 transition-colors duration-300">
                    {plan.description}
                  </p>
                </div>

                <button
                  type="button"
                  data-cursor="action"
                  onClick={() =>
                    onOpenDrawer({
                      rubro: plan.defaultRubro,
                      plan: cleanTitle,
                    })
                  }
                  className="group/btn shrink-0 inline-flex min-h-[44px] items-center gap-2 border border-white/20 group-hover:border-[#050505]/35 hover:!bg-[#050505] hover:!text-[#F4F1EA] px-4 py-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[#F4F1EA] group-hover:text-[#050505] transition-colors duration-300 self-start sm:self-center"
                >
                  <span>CONSULTAR ALCANCE</span>
                  <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
                    ↗
                  </span>
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
