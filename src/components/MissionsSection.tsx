"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MISSIONS } from "@/data/ellikData";
import { MissionVisualSurface } from "./MissionVisualSurface";

export function MissionsSection() {
  return (
    <section
      id="proyectos"
      className="py-24 lg:py-36 border-t border-[var(--border-hairline)]"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="section-label">PROYECTOS</p>

        <h2 className="heading-section mt-6 max-w-4xl text-[var(--text-primary)]">
          DESARROLLOS REALES PROBANDO RESULTADOS EN{" "}
          <span className="serif-accent">PRODUCCIÓN.</span>
        </h2>

        <div className="mt-16 border-t border-[var(--border-hairline)]">
          {MISSIONS.map((mission, idx) => (
            <motion.article
              key={mission.id}
              id={mission.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="border-b border-[var(--border-hairline)] py-14 lg:py-20 grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-12 items-start"
            >
              {/* Columna izquierda: información comercial limpia */}
              <div className="xl:col-span-5 flex flex-col justify-between h-full">
                <div>
                  <p className="section-label">{mission.category}</p>

                  <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold uppercase tracking-[-0.02em] leading-[1.05] text-[var(--text-primary)]">
                    {mission.title}
                  </h3>

                  <p className="editorial-body mt-5 text-[var(--text-secondary)]">
                    {mission.problemSolved}
                  </p>

                  <p className="mt-7 font-mono text-[11px] tracking-[0.18em] uppercase text-[#71717A]">
                    {mission.metric}
                  </p>
                </div>

                <div className="mt-9 pt-6 border-t border-[var(--border-hairline)]">
                  <a
                    href={mission.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="action"
                    className="group inline-flex items-center gap-3 border border-[rgba(255,255,255,0.25)] px-6 py-3.5 font-mono text-xs tracking-[0.16em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--text-primary)] hover:text-[#050505] hover:border-[var(--text-primary)]"
                  >
                    <span>PROBAR PÁGINA EN VIVO</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              {/* Columna derecha: Marco 16:10 limpio listo para captura real */}
              <div className="xl:col-span-7">
                <a
                  href={mission.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="view"
                  aria-label={`Ver ${mission.title}`}
                  className="group block border border-[var(--border-hairline)] bg-[var(--bg-elevated)] transition-colors duration-200 hover:border-[var(--border-active)]"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-hairline)] px-4 py-2.5 bg-[#08080A]">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] truncate">
                      https://{mission.domainDisplay}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)] shrink-0" />
                  </div>

                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <MissionVisualSurface mission={mission} />
                  </div>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
