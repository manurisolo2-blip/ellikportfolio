"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
} from "@/data/ellikData";
import {
  AnimatedHeading,
  HairlineRule,
  orbitalGridStaggerVariants,
  SpotlightSurface,
} from "./AnimatedHeading";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const isGridInView = useInView(gridRef, { once: true, margin: "-10%" });

  return (
    <section id="modalidades" className="relative py-24 lg:py-36">
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div ref={sectionRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <AnimatedHeading
            prefix="CÓDIGO A MEDIDA, VELOCIDAD DE EJECUCIÓN Y VISIÓN COMERCIAL —"
            accent="SIN INTERMEDIARIOS."
            className="heading-section lg:col-span-8 text-[var(--text-primary)]"
          />

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
            ocultos por transacción. Soporte técnico directo de desarrollador a
            dueño.
          </motion.p>
        </div>

        {/* Grilla con entrada espacial escalonada, líneas de 1px y retícula orbital */}
        <motion.div
          ref={gridRef}
          variants={orbitalGridStaggerVariants}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          className="relative mt-16 grid grid-cols-1 lg:grid-cols-3 bg-[var(--bg-elevated)]"
        >
          <HairlineRule className="pointer-events-none absolute top-0 left-0 right-0 z-20" />
          <HairlineRule
            delay={0.14}
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
          />
          <HairlineRule
            orientation="vertical"
            delay={0.08}
            className="pointer-events-none absolute top-0 bottom-0 left-0 z-20"
          />
          <HairlineRule
            orientation="vertical"
            delay={0.16}
            className="pointer-events-none absolute top-0 bottom-0 right-0 z-20"
          />
          <HairlineRule
            orientation="vertical"
            delay={0.2}
            className="pointer-events-none hidden lg:block absolute top-0 bottom-0 left-1/3 z-20"
          />
          <HairlineRule
            orientation="vertical"
            delay={0.28}
            className="pointer-events-none hidden lg:block absolute top-0 bottom-0 left-2/3 z-20"
          />

          {INVESTMENT_PLANS.map((plan, index) => (
            <React.Fragment key={plan.code}>
              {index > 0 && (
                <HairlineRule
                  delay={0.16 + index * 0.08}
                  className="lg:hidden z-20"
                />
              )}

              <SpotlightSurface
                staggerControlled
                className="p-8 lg:p-10"
              >
                <div>
                  <h3 className="font-display text-xl lg:text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)]">
                    {plan.title}
                  </h3>

                  <p className="editorial-body mt-4 text-[var(--text-secondary)]">
                    {plan.description}
                  </p>

                  <div className="relative mt-7 pt-6">
                    <HairlineRule
                      delay={0.22 + index * 0.08}
                      className="absolute top-0 left-0 right-0"
                    />

                    <ul className="space-y-3">
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
                </div>

                <div className="relative mt-10 pt-6">
                  <HairlineRule
                    delay={0.28 + index * 0.08}
                    className="absolute top-0 left-0 right-0"
                  />

                  <button
                    type="button"
                    data-cursor="action"
                    onClick={() =>
                      onOpenDrawer({
                        rubro: plan.defaultRubro,
                        plan: plan.fullTitle,
                      })
                    }
                    className="group/btn font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] hover:text-[var(--accent-starlight)] transition-colors inline-flex items-center gap-2 px-2 py-1"
                  >
                    <span>CONSULTAR ALCANCE</span>
                    <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </SpotlightSurface>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
