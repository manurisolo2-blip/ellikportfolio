"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ELLIK_CONFIG, type BusinessCategory } from "@/data/ellikData";
import {
  AnimatedHeading,
  HairlineRule,
  MagneticButton,
} from "./AnimatedHeading";

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
      id="contacto"
      className="relative overflow-hidden pt-24 pb-12 lg:pt-36 lg:pb-14"
    >
      <HairlineRule className="absolute top-0 inset-x-0" />

      <div
        ref={sectionRef}
        className="relative z-10"
        style={{ perspective: "1000px" }}
      >
        <AnimatedHeading
          prefix="¿LISTO PARA DEJAR DE PERDER"
          accent="PEDIDOS?"
          className="heading-hero max-w-5xl text-[var(--text-primary)]"
        />

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
          className="mt-12"
        >
          <MagneticButton
            onClick={() => onOpenDrawer()}
            className="border border-[rgba(255,255,255,0.35)] bg-[#050505] px-8 py-5 font-mono text-xs sm:text-sm tracking-[0.16em] uppercase text-[var(--text-primary)] transition-colors duration-200 hover:border-[#FFFFFF]"
          >
            INICIAR DIAGNÓSTICO DE 10 MIN
          </MagneticButton>
        </motion.div>
      </div>

      {/* Footer minimalista con hairline auto-dibujable */}
      <footer className="relative z-10 mt-28 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <HairlineRule
          delay={0.25}
          className="absolute top-0 left-0 right-0"
        />

        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#71717A]">
          © 2026 ELLIK
        </p>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-secondary)]">
          <a
            href={directWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="action"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            WHATSAPP ↗
          </a>
          <span aria-hidden="true" className="text-[#52525B]">
            ·
          </span>
          <a
            href={ELLIK_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="action"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            INSTAGRAM ↗
          </a>
          <span aria-hidden="true" className="text-[#52525B]">
            ·
          </span>
          <a
            href={`mailto:${ELLIK_CONFIG.email}`}
            data-cursor="action"
            className="hover:text-[var(--text-primary)] transition-colors normal-case tracking-[0.06em]"
          >
            {ELLIK_CONFIG.email}
          </a>
        </div>
      </footer>
    </section>
  );
}
