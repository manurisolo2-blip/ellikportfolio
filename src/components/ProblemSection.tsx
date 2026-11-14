"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PAIN_POINTS } from "@/data/ellikData";
import { AnimatedHeading, HairlineRule } from "./AnimatedHeading";

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section id="problema" className="relative py-24 lg:py-36">
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div ref={sectionRef} style={{ perspective: "1000px" }}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="section-label"
        >
          EL PROBLEMA
        </motion.p>

        <AnimatedHeading
          prefix="LA MAYORÍA DE LOS COMERCIOS NO TIENE UN PROBLEMA DE CLIENTES. TIENE UN PROBLEMA DE"
          accent="FRICCIÓN."
          className="heading-section mt-6 max-w-4xl text-[var(--text-primary)]"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="section-label mt-14 mb-6"
        >
          ¿TE PASA ESTO HOY EN TU NEGOCIO?
        </motion.p>

        <div className="relative">
          <HairlineRule delay={0.18} />

          {PAIN_POINTS.map((point, index) => (
            <motion.div
              key={point.code}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.48,
                delay: 0.24 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden py-7 lg:py-8"
            >
              {/* Cortina luminosa sutil expandiéndose verticalmente desde el centro */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-center scale-y-0 bg-white/[0.03] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] origin-center scale-y-0 bg-[var(--accent-starlight)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
              />

              <div className="relative z-10 flex items-baseline justify-between gap-6 px-2">
                <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-10 min-w-0">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-[#71717A] group-hover:text-[#FFFFFF] transition-colors duration-200 shrink-0 md:w-16">
                    {point.code}
                  </span>

                  <p className="editorial-body text-base md:text-lg text-[var(--text-secondary)] group-hover:text-[#FFFFFF] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[12px]">
                    {point.text}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block shrink-0 font-mono text-sm text-[#FFFFFF] opacity-0 -translate-x-2 -translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
                >
                  ↘
                </span>
              </div>

              <HairlineRule
                delay={0.28 + index * 0.08}
                className="absolute bottom-0 left-0 right-0 transition-colors duration-200 group-hover:bg-[var(--border-active)]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
