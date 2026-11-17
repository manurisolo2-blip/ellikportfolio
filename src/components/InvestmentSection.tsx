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
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      id="servicios"
      className="relative w-full bg-[#F4F1EA] text-[#050505] py-28 md:py-36 selection:bg-[#050505] selection:text-[#F4F1EA]"
    >
      <div
        ref={sectionRef}
        className="pl-6 lg:pl-48 pr-6 lg:pr-16"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-semibold text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.96] tracking-[-0.03em] text-[#050505] max-w-4xl"
        >
          Tres formas de trabajar juntos.
        </motion.h2>

        <div className="mt-16 md:mt-20 border-b-2 border-[#050505]">
          {INVESTMENT_PLANS.map((plan, index) => (
            <motion.article
              key={plan.code}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              data-cursor="action"
              onClick={() =>
                onOpenDrawer({
                  rubro: plan.defaultRubro,
                  plan: plan.title,
                })
              }
              className="border-t-2 border-[#050505] py-10 px-4 -mx-4 md:px-6 md:-mx-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer transition-colors duration-200 hover:bg-[#050505]/[0.04]"
            >
              <div className="max-w-2xl">
                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] leading-[1.08] text-[#050505]">
                  {plan.title}
                </h3>

                <p className="mt-3 font-sans text-base md:text-[17px] leading-relaxed text-[#050505]/75">
                  {plan.description}
                </p>
              </div>

              <button
                type="button"
                data-cursor="action"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDrawer({
                    rubro: plan.defaultRubro,
                    plan: plan.title,
                  });
                }}
                className="shrink-0 inline-flex min-h-[44px] items-center gap-2 border-2 border-[#050505] bg-transparent px-5 py-3 font-mono text-xs tracking-[0.12em] uppercase text-[#050505] transition-colors duration-200 group-hover:bg-[#050505] group-hover:text-[#F4F1EA] self-start md:self-center"
              >
                <span>Consultar</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
