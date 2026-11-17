"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SYSTEM_PILLARS } from "@/data/ellikData";

function toSentenceCase(text: string): string {
  const clean = text.trim();
  if (!clean) return clean;
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

const STEPPED_OFFSETS = ["lg:ml-0", "lg:ml-[28%]", "lg:ml-[54%]"] as const;

export function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section id="solucion" className="relative py-28 lg:py-40">
      <div ref={sectionRef}>
        <h2 className="font-display text-[clamp(2.1rem,4.2vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.025em] max-w-3xl">
          <span className="text-white">
            Páginas rápidas pensadas para que el cliente elija solo
          </span>{" "}
          <span className="text-[#71717A]">y te llegue el pedido armado.</span>
        </h2>

        {/* Composición Escalonada en Escalera: sin números ni bordes de tabla */}
        <div className="mt-16 lg:mt-24 space-y-6 lg:space-y-10">
          {SYSTEM_PILLARS.map((pillar, index) => (
            <motion.article
              key={pillar.code}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.58,
                delay: index * 0.14,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`max-w-md py-12 ${
                STEPPED_OFFSETS[index] ?? "lg:ml-0"
              }`}
            >
              <div aria-hidden="true" className="w-8 h-[2px] bg-[#F4F1EA] mb-6" />

              <h3 className="font-display text-3xl font-medium text-white tracking-[-0.02em] leading-[1.08] mb-3">
                {toSentenceCase(pillar.title)}
              </h3>

              <p className="font-sans text-base text-[#8A8A93] leading-relaxed">
                {pillar.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
