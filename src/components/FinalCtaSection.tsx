"use client";

import React, { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ELLIK_CONFIG,
  MISSIONS,
  type BusinessCategory,
} from "@/data/ellikData";
import {
  AnimatedHeading,
  HairlineRule,
  MagneticButton,
} from "./AnimatedHeading";
import HalftoneWordmarkFooter, {
  type FooterColumn,
} from "./ui/halftone-wordmark-footer";

interface FinalCtaSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function FinalCtaSection({ onOpenDrawer }: FinalCtaSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="contacto"
      className="relative overflow-hidden pt-24 pb-24 lg:pt-36 lg:pb-32"
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
    </section>
  );
}

/**
 * Footer halftone a ancho completo (100vw) fuera del margen izquierdo de <main>.
 */
export function EllikFooter() {
  const directWhatsappUrl = `https://wa.me/${ELLIK_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    "Hola ELLIK, quiero consultar por una página web para mi negocio."
  )}`;

  const footerColumns: FooterColumn[] = useMemo(
    () => [
      {
        title: "SECCIONES",
        links: [
          { label: "Inicio", href: "#inicio" },
          { label: "El Problema", href: "#problema" },
          { label: "La Solución", href: "#solucion" },
          { label: "Modalidades", href: "#modalidades" },
        ],
      },
      {
        title: "PROYECTOS EN VIVO",
        links: MISSIONS.map((mission) => ({
          label: `${mission.shortTitle} ↗`,
          href: mission.liveUrl,
        })),
      },
      {
        title: "CONTACTO",
        links: [
          { label: "WhatsApp ↗", href: directWhatsappUrl },
          { label: "Instagram ↗", href: ELLIK_CONFIG.instagramUrl },
          {
            label: ELLIK_CONFIG.email,
            href: `mailto:${ELLIK_CONFIG.email}`,
          },
        ],
      },
    ],
    [directWhatsappUrl]
  );

  return (
    <div className="relative z-30 lg:z-[45] w-full border-t border-[var(--border-hairline)] bg-[#050505] pb-[68px] lg:pb-0">
      <HalftoneWordmarkFooter
        wordmark="ELLIK"
        label="ELLIK — DISEÑO & DESARROLLO WEB"
        meta="© 2026 ELLIK · OPERANDO EN PRODUCCIÓN"
        columns={footerColumns}
        preset="night"
        palette={{ background: "#050505", ink: "#F4F1EA", warm: "#FFFFFF" }}
        dotGap={5}
        radius={85}
        crop={0.14}
        grain={0.45}
        fontFamily="var(--font-display), sans-serif"
        fontWeight={700}
        monoFamily="var(--font-mono), monospace"
        backToTopLabel="VOLVER ARRIBA ↑"
        height="clamp(600px, 48vw, 640px)"
      />
    </div>
  );
}
