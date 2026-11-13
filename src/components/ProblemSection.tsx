"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PAIN_POINTS } from "@/data/ellikData";

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="friccion"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <div ref={sectionRef} style={{ perspective: "1000px" }}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="telemetry-label text-xs text-[var(--text-muted)]"
        >
          02 // DIAGNÓSTICO DE FRICCIÓN
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 26, rotateX: -18 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "bottom left" }}
          className="heading-section mt-6 max-w-4xl text-[var(--text-primary)]"
        >
          LA MAYORÍA DE LOS COMERCIOS NO TIENE UN PROBLEMA DE CLIENTES. TIENE UN
          PROBLEMA DE <span className="serif-accent">FRICCIÓN.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="telemetry-label mt-14 mb-6 text-xs text-[var(--text-secondary)]"
        >
          ¿TE PASA ESTO HOY EN TU NEGOCIO?
        </motion.p>

        <div className="relative">
          {/* Línea superior autodibujada */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{
              duration: 0.65,
              delay: 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "left" }}
            className="h-px w-full bg-[var(--border-hairline)]"
          />

          {PAIN_POINTS.map((point, index) => (
            <motion.div
              key={point.code}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.48,
                delay: 0.28 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative py-7 lg:py-8 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              {/* Barra lateral de intensidad al hacer hover */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 bottom-0 w-[2px] origin-top scale-y-0 bg-[var(--accent-starlight)] transition-transform duration-200 group-hover:scale-y-100"
              />

              <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8 px-1 transition-transform duration-200 group-hover:translate-x-2">
                <div className="flex items-center gap-4 shrink-0 md:w-64">
                  <span className="font-mono text-xs tracking-[0.16em] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    [{point.code}]
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--text-muted)] group-hover:text-[var(--accent-starlight)] transition-colors">
                    {point.signal}
                  </span>
                </div>

                <p className="editorial-body text-base md:text-lg text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {point.text}
                </p>
              </div>

              {/* Línea inferior autodibujada */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.32 + index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: "left" }}
                className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-hairline)] transition-colors duration-200 group-hover:bg-[var(--border-active)]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
