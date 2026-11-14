"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SYSTEM_PILLARS } from "@/data/ellikData";

export function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="solucion"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <div ref={sectionRef}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="section-label"
        >
          LA SOLUCIÓN
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.58,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="heading-section mt-6 max-w-5xl text-[var(--text-primary)]"
        >
          PÁGINAS RÁPIDAS PENSADAS PARA QUE EL CLIENTE ELIJA SOLO Y TE LLEGUE EL
          PEDIDO <span className="serif-accent">ARMADO.</span>
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 border border-[var(--border-hairline)] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-hairline)] bg-[var(--bg-elevated)]">
          {SYSTEM_PILLARS.map((pillar, index) => (
            <motion.article
              key={pillar.code}
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.14 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between py-14 lg:py-20 px-8 lg:px-12 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <div>
                <span className="font-mono text-[11px] tracking-[0.18em] text-[#71717A]">
                  {pillar.code}
                </span>

                <h3 className="mt-8 font-display text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)]">
                  {pillar.title}
                </h3>

                <p className="editorial-body mt-5 text-[var(--text-secondary)]">
                  {pillar.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
