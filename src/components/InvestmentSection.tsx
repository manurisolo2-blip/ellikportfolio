"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
} from "@/data/ellikData";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="modalidades"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <div ref={sectionRef}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="section-label"
        >
          MODALIDADES
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
            ocultos por transacción. Soporte técnico directo de desarrollador a
            dueño.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 border border-[var(--border-hairline)] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-hairline)] bg-[var(--bg-elevated)]">
          {INVESTMENT_PLANS.map((plan, index) => (
            <motion.article
              key={plan.code}
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.14 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between p-8 lg:p-10 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <div>
                <h3 className="font-display text-xl lg:text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)]">
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

              <div className="mt-10 pt-6 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  data-cursor="action"
                  onClick={() =>
                    onOpenDrawer({
                      rubro: plan.defaultRubro,
                      plan: plan.fullTitle,
                    })
                  }
                  className="group font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] hover:text-[var(--accent-starlight)] transition-colors inline-flex items-center gap-2 px-2 py-1"
                >
                  <span>CONSULTAR ALCANCE</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
