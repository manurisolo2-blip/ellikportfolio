"use client";

import React, { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ELLIK_CONFIG,
  MISSIONS_BY_LOCALE,
  type BusinessCategory,
} from "@/data/ellikData";
import { useLanguage } from "@/context/LanguageContext";
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
  const { locale } = useLanguage();
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
          prefix={
            locale === "es"
              ? "¿Listo para dejar de perder"
              : "Ready to stop losing"
          }
          accent={locale === "es" ? "pedidos?" : "orders?"}
          toneVariant="warm"
          className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-medium leading-[1.0] tracking-[-0.03em] max-w-5xl"
        />

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.55,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-7 max-w-xl font-sans text-base leading-relaxed text-[var(--text-secondary)]"
        >
          {locale === "es"
            ? "En 10 minutos revisamos cómo llegan tus consultas hoy y definimos qué sistema web necesita tu local para empezar a vender directo."
            : "In 10 minutes we review how customer inquiries reach you today and map out the web system your business needs to sell directly."}
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
            className="inline-flex min-h-[44px] items-center border border-[rgba(255,255,255,0.35)] bg-[#050505] px-8 py-5 font-sans text-sm font-medium tracking-[0.02em] text-[var(--text-primary)] transition-colors duration-200 hover:border-[#FFFFFF]"
          >
            {locale === "es"
              ? "Iniciar diagnóstico de 10 min"
              : "Start 10-min review"}
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
  const { locale } = useLanguage();
  const missions = MISSIONS_BY_LOCALE[locale];

  const directWhatsappUrl = `https://wa.me/${ELLIK_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    locale === "es"
      ? "Hola ELLIK, quiero consultar por una página web para mi negocio."
      : "Hi ELLIK, I'd like to inquire about a custom website for my business."
  )}`;

  const footerColumns: FooterColumn[] = useMemo(
    () => [
      {
        title: locale === "es" ? "SECCIONES" : "SECTIONS",
        links:
          locale === "es"
            ? [
                { label: "Inicio", href: "#inicio" },
                { label: "El Problema", href: "#problema" },
                { label: "Obra", href: "#proyectos" },
                { label: "Servicios", href: "#servicios" },
              ]
            : [
                { label: "Home", href: "#inicio" },
                { label: "The Problem", href: "#problema" },
                { label: "Work", href: "#proyectos" },
                { label: "Services", href: "#servicios" },
              ],
      },
      {
        title: locale === "es" ? "PROYECTOS EN VIVO" : "LIVE PROJECTS",
        links: missions.map((mission) => ({
          label: `${mission.shortTitle} ↗`,
          href: mission.liveUrl,
        })),
      },
      {
        title: locale === "es" ? "CONTACTO" : "CONTACT",
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
    [directWhatsappUrl, locale, missions]
  );

  return (
    <div className="relative z-30 lg:z-[45] w-full border-t border-[var(--border-hairline)] bg-[#050505] pb-[68px] lg:pb-0">
      <HalftoneWordmarkFooter
        wordmark="ELLIK"
        label={
          locale === "es"
            ? "ELLIK — DISEÑO & DESARROLLO WEB"
            : "ELLIK — WEB DESIGN & DEVELOPMENT"
        }
        meta={
          locale === "es"
            ? "© 2026 ELLIK · OPERANDO EN PRODUCCIÓN"
            : "© 2026 ELLIK · RUNNING IN PRODUCTION"
        }
        columns={footerColumns}
        preset="night"
        palette={{ background: "#050505", ink: "#F4F1EA", warm: "#FFFFFF" }}
        dotGap={5}
        radius={85}
        crop={0.14}
        grain={0.45}
        fontFamily="var(--font-display), sans-serif"
        fontWeight={700}
        monoFamily="var(--font-sans), 'Satoshi', sans-serif"
        backToTopLabel={locale === "es" ? "VOLVER ARRIBA ↑" : "BACK TO TOP ↑"}
        height="clamp(600px, 48vw, 640px)"
      />
    </div>
  );
}
