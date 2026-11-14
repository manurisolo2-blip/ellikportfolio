"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SYSTEM_PILLARS } from "@/data/ellikData";
import {
  AnimatedHeading,
  HairlineRule,
  SpotlightSurface,
} from "./AnimatedHeading";

export function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section id="solucion" className="relative py-24 lg:py-36">
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div ref={sectionRef}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="section-label"
        >
          LA SOLUCIÓN
        </motion.p>

        <AnimatedHeading
          prefix="PÁGINAS RÁPIDAS PENSADAS PARA QUE EL CLIENTE ELIJA SOLO Y TE LLEGUE EL PEDIDO"
          accent="ARMADO."
          className="heading-section mt-6 max-w-5xl text-[var(--text-primary)]"
        />

        {/* Grilla con bordes y divisores de 1px auto-dibujables + Spotlight por columna */}
        <div className="relative mt-16 grid grid-cols-1 lg:grid-cols-3 bg-[var(--bg-elevated)]">
          {/* Borde perimetral y divisores internos animados */}
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

          {SYSTEM_PILLARS.map((pillar, index) => (
            <React.Fragment key={pillar.code}>
              {index > 0 && (
                <HairlineRule
                  delay={0.16 + index * 0.08}
                  className="lg:hidden z-20"
                />
              )}

              <SpotlightSurface
                delay={0.14 + index * 0.1}
                className="py-14 lg:py-20 px-8 lg:px-12"
              >
                <div>
                  <span className="font-mono text-[11px] tracking-[0.18em] text-[#71717A] transition-colors duration-200 group-hover:text-[#FFFFFF]">
                    {pillar.code}
                  </span>

                  <h3 className="mt-8 font-display text-2xl font-bold uppercase tracking-[-0.02em] text-[var(--text-primary)]">
                    {pillar.title}
                  </h3>

                  <p className="editorial-body mt-5 text-[var(--text-secondary)]">
                    {pillar.description}
                  </p>
                </div>
              </SpotlightSurface>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
