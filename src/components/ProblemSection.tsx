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

      <div
        ref={sectionRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start"
      >
        {/* Columna Izquierda (Editorial 5/12, Sticky en desktop) */}
        <div
          className="lg:col-span-5 lg:sticky lg:top-32"
          style={{ perspective: "1000px" }}
        >
          <AnimatedHeading
            prefix="La mayoría de los comercios no tiene un problema de clientes."
            accent="Tiene un problema de fricción."
            toneVariant="silver"
            className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.02] tracking-[-0.025em] font-medium"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 font-sans text-[15px] text-[#8A8A93] leading-relaxed max-w-sm"
          >
            Cuando hacer un pedido o consultar un talle lleva más de tres pasos,
            el cliente abandona en silencio.
          </motion.p>
        </div>

        {/* Columna Derecha (Dolores Reales 7/12) */}
        <div className="lg:col-span-7">
          <div className="relative border-t border-white/[0.1]">
            {PAIN_POINTS.map((point, index) => (
              <motion.div
                key={point.code}
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.48,
                  delay: 0.18 + index * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden py-7 lg:py-8 border-b border-white/[0.1]"
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
                  <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8 min-w-0">
                    <span className="font-mono text-[11px] tracking-[0.14em] text-[#52525B] group-hover:text-[#FFFFFF] transition-colors duration-200 shrink-0 md:w-12">
                      {point.code}
                    </span>

                    <p className="font-sans text-lg md:text-xl font-normal leading-relaxed text-[#D4D4D8] group-hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[12px]">
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
