"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ELLIK_CONFIG, type BusinessCategory } from "@/data/ellikData";

interface FinalCtaSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function FinalCtaSection({ onOpenDrawer }: FinalCtaSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const directWhatsappUrl = `https://wa.me/${ELLIK_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    "Hola ELLIK, quiero consultar por una página web para mi negocio."
  )}`;

  return (
    <section
      id="despegue"
      className="relative overflow-hidden pt-24 pb-12 lg:pt-36 lg:pb-14 border-t border-[var(--border-hairline)]"
    >
      {/* Anillos 3D de convergencia orbital animados al fondo de la sección */}
      <div
        aria-hidden="true"
        style={{ perspective: "1000px" }}
        className="pointer-events-none absolute right-0 top-12 -z-0 hidden md:flex h-[460px] w-[460px] items-center justify-center opacity-60"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={
            isInView
              ? { scale: 1, opacity: 1, rotateZ: 360 }
              : { scale: 0.7, opacity: 0 }
          }
          transition={{
            scale: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.9 },
            rotateZ: { duration: 60, repeat: Infinity, ease: "linear" },
          }}
          style={{ rotateX: 62, rotateY: -18, transformStyle: "preserve-3d" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 460 460" className="h-full w-full overflow-visible">
            <circle
              cx="230"
              cy="230"
              r="210"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="3 8"
            />
            <circle
              cx="230"
              cy="230"
              r="148"
              fill="none"
              stroke="rgba(244,241,234,0.12)"
              strokeWidth="1"
            />
            <rect x="228" y="18" width="4" height="4" fill="#F4F1EA" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ scale: 0.65, opacity: 0 }}
          animate={
            isInView
              ? { scale: 1, opacity: 1, rotateZ: -360 }
              : { scale: 0.65, opacity: 0 }
          }
          transition={{
            scale: { duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.9, delay: 0.1 },
            rotateZ: { duration: 42, repeat: Infinity, ease: "linear" },
          }}
          style={{ rotateX: -36, rotateY: 54, transformStyle: "preserve-3d" }}
          className="absolute inset-12"
        >
          <svg viewBox="0 0 360 360" className="h-full w-full overflow-visible">
            <circle
              cx="180"
              cy="180"
              r="160"
              fill="none"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1"
            />
            <rect x="338" y="178" width="4" height="4" fill="#FFFFFF" />
          </svg>
        </motion.div>
      </div>

      <div ref={sectionRef} className="relative z-10" style={{ perspective: "1000px" }}>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="telemetry-label text-xs text-[var(--text-muted)]"
        >
          06 // INICIAR DESPEGUE
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 34, rotateX: -24 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            duration: 0.65,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "bottom left" }}
          className="heading-hero mt-8 max-w-5xl text-[var(--text-primary)]"
        >
          ¿LISTO PARA DEJAR DE PERDER{" "}
          <span className="serif-accent">PEDIDOS?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.55,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="editorial-body mt-7 max-w-xl text-[var(--text-secondary)]"
        >
          En 10 minutos revisamos cómo llegan tus consultas hoy y definimos qué
          sistema web necesita tu local para empezar a vender directo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.55,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-12 inline-block relative"
        >
          {/* Pulso orbital sutil alrededor del CTA */}
          <motion.span
            aria-hidden="true"
            animate={{
              opacity: [0.22, 0.55, 0.22],
              scale: [1, 1.025, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-1.5 border border-white/20"
          />

          <button
            type="button"
            onClick={() => onOpenDrawer()}
            className="group relative overflow-hidden border border-[rgba(255,255,255,0.35)] bg-[#050505] px-8 py-5 font-mono text-xs sm:text-sm tracking-[0.16em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--text-primary)] hover:text-[#050505] hover:border-[var(--text-primary)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-[320%]"
            />
            <span className="relative z-10">
              [ INICIAR DIAGNÓSTICO DE 10 MIN ]
            </span>
          </button>
        </motion.div>
      </div>

      {/* Footer minimalista */}
      <footer className="relative z-10 mt-28 pt-8 border-t border-[var(--border-hairline)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="telemetry-label text-[11px] text-[var(--text-muted)]">
            {ELLIK_CONFIG.coordinates}
          </p>
          <p className="telemetry-label text-[11px] text-[var(--text-muted)]">
            © 2026 ELLIK — TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href={directWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="telemetry-label text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            WHATSAPP ↗
          </a>
          <a
            href={ELLIK_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="telemetry-label text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            INSTAGRAM ↗
          </a>
          <a
            href={`mailto:${ELLIK_CONFIG.email}`}
            className="telemetry-label text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {ELLIK_CONFIG.email}
          </a>
        </div>
      </footer>
    </section>
  );
}
