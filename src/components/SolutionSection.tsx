"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SYSTEM_PILLARS } from "@/data/ellikData";
import { AnimatedHeading, HairlineRule } from "./AnimatedHeading";

function toSentenceCase(text: string): string {
  const clean = text.trim();
  if (!clean) return clean;
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

export function SolutionSection() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const isListInView = useInView(listRef, { once: true, margin: "-10%" });

  return (
    <section id="solucion" className="relative py-24 lg:py-36">
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div>
        <AnimatedHeading
          prefix="Páginas rápidas pensadas para que el cliente elija solo"
          accent="y te llegue el pedido armado."
          toneVariant="silver"
          className="text-[clamp(2.1rem,4.2vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.025em] max-w-3xl"
        />

        {/* Matriz Arquitectónica Escalonada: filas horizontales limpias sin cajas de IA */}
        <div ref={listRef} className="mt-16 border-t border-white/[0.12]">
          {SYSTEM_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.code}
              initial={{ opacity: 0, y: 20 }}
              animate={isListInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10 border-b border-white/[0.12] items-baseline group hover:bg-white/[0.015] transition-colors px-2"
            >
              <div className="md:col-span-2">
                <span className="font-mono text-xs tracking-[0.14em] text-[#71717A] group-hover:text-[#F4F1EA] transition-colors">
                  {pillar.code}
                </span>
              </div>

              <div className="md:col-span-5">
                <h3 className="font-display text-2xl md:text-3xl font-medium text-white tracking-[-0.02em] leading-[1.05] group-hover:translate-x-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {toSentenceCase(pillar.title)}
                </h3>
              </div>

              <div className="md:col-span-5">
                <p className="font-sans text-base text-[#8A8A93] leading-relaxed group-hover:text-[#D4D4D8] transition-colors">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
