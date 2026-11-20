"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  INVESTMENT_PLANS_BY_LOCALE,
  type BusinessCategory,
} from "@/data/ellikData";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import {
  ProjectDeck,
  type DeckItem,
  type DeckLabels,
} from "@/components/ui/scroll-stacking-cards";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

const DECK_VISUAL_META: Record<
  string,
  {
    id: string;
    eyebrow: Record<Locale, string>;
    image: string;
    accent: string;
    surfaceBg: string;
    spineBg: string;
    ctaLabel: Record<Locale, string>;
    ctaSublabel: Record<Locale, string>;
    exampleLabel: string;
    estimatedTime: Record<Locale, string>;
    focus: Record<Locale, string>;
  }
> = {
  "01": {
    id: "pedidos-carta",
    eyebrow: {
      es: "GASTRONOMÍA · PEDIDOS A WHATSAPP",
      en: "HOSPITALITY · WHATSAPP ORDERS",
    },
    image: "/previews/mojo-desktop.webp",
    accent: "#E06D3B",
    surfaceBg: "linear-gradient(135deg, #21120B 0%, #110B09 44%, #1A0E09 100%)",
    spineBg: "linear-gradient(90deg, #26140C 0%, #170D0A 60%, #1F110B 100%)",
    ctaLabel: {
      es: "Consultar esta modalidad",
      en: "Inquire about this option",
    },
    ctaSublabel: {
      es: "Charla directa por WhatsApp",
      en: "Direct chat on WhatsApp",
    },
    exampleLabel: "mojo-grille-demo.vercel.app",
    estimatedTime: { es: "5 a 7 días", en: "5 to 7 days" },
    focus: { es: "Mobile-first + WhatsApp", en: "Mobile-first + WhatsApp" },
  },
  "02": {
    id: "catalogo-tienda",
    eyebrow: {
      es: "INDUMENTARIA · VENTA DESDE EL CELULAR",
      en: "APPAREL · MOBILE STOREFRONT",
    },
    image: "/previews/dopamine-desktop.webp",
    accent: "#D9A45B",
    surfaceBg: "linear-gradient(135deg, #1E180B 0%, #100E0A 44%, #18130A 100%)",
    spineBg: "linear-gradient(90deg, #231C0D 0%, #15120B 60%, #1C160B 100%)",
    ctaLabel: {
      es: "Consultar esta modalidad",
      en: "Inquire about this option",
    },
    ctaSublabel: {
      es: "Charla directa por WhatsApp",
      en: "Direct chat on WhatsApp",
    },
    exampleLabel: "dopamine-three-omega.vercel.app",
    estimatedTime: { es: "7 a 12 días", en: "7 to 12 days" },
    focus: { es: "Catálogo + stock", en: "Catalog + stock" },
  },
  "03": {
    id: "desarrollo-medida",
    eyebrow: {
      es: "A MEDIDA · CÓDIGO PROPIO",
      en: "BESPOKE · CUSTOM CODE",
    },
    image: "/previews/rio3-desktop.webp",
    accent: "#5B9BD5",
    surfaceBg: "linear-gradient(135deg, #0D192B 0%, #090E16 44%, #0C1625 100%)",
    spineBg: "linear-gradient(90deg, #102036 0%, #0B131F 60%, #0F1B2E 100%)",
    ctaLabel: {
      es: "Consultar esta modalidad",
      en: "Inquire about this option",
    },
    ctaSublabel: {
      es: "Charla directa por WhatsApp",
      en: "Direct chat on WhatsApp",
    },
    exampleLabel: "deportistasrio3.vercel.app",
    estimatedTime: { es: "Según alcance", en: "Scoped to project" },
    focus: { es: "100 % personalizado", en: "100% custom-built" },
  },
};

const DECK_LABELS_BY_LOCALE: Record<Locale, DeckLabels> = {
  es: {
    estimatedTime: "TIEMPO ESTIMADO",
    focus: "ENFOQUE",
    liveExample: "EJEMPLO REAL",
    viewSpine: "VER ↑",
    backToCard: (index, name) => `Volver a la tarjeta ${index}: ${name}`,
    deckAriaLabel: "Modalidades de servicio",
  },
  en: {
    estimatedTime: "ESTIMATED TIME",
    focus: "FOCUS",
    liveExample: "LIVE EXAMPLE",
    viewSpine: "VIEW ↑",
    backToCard: (index, name) => `Back to card ${index}: ${name}`,
    deckAriaLabel: "Service options",
  },
};

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const { locale } = useLanguage();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(headerRef, { once: true, margin: "-10%" });
  const plans = INVESTMENT_PLANS_BY_LOCALE[locale];

  const deckItems = useMemo<DeckItem[]>(() => {
    return plans.map((plan) => {
      const meta = DECK_VISUAL_META[plan.code];

      if (!meta) {
        return {
          id: `plan-${plan.code}`,
          index: plan.code,
          name: plan.title,
          eyebrow: plan.defaultRubro.toUpperCase(),
          summary: plan.description,
          deliverables: plan.scopeItems,
          image: "/previews/mojo-desktop.webp",
          accent: "#E06D3B",
          surfaceBg:
            "linear-gradient(135deg, #21120B 0%, #110B09 44%, #1A0E09 100%)",
          spineBg:
            "linear-gradient(90deg, #26140C 0%, #170D0A 60%, #1F110B 100%)",
          ctaLabel:
            locale === "es"
              ? "Consultar esta modalidad"
              : "Inquire about this option",
          ctaSublabel:
            locale === "es"
              ? "Charla directa por WhatsApp"
              : "Direct chat on WhatsApp",
          exampleLabel: "ellik.studio",
          estimatedTime:
            locale === "es" ? "Según alcance" : "Scoped to project",
          focus: locale === "es" ? "A medida" : "Custom-built",
          planKey: plan.fullTitle,
        };
      }

      return {
        id: meta.id,
        index: plan.code,
        name: plan.title,
        eyebrow: meta.eyebrow[locale],
        summary: plan.description,
        deliverables: plan.scopeItems,
        image: meta.image,
        accent: meta.accent,
        surfaceBg: meta.surfaceBg,
        spineBg: meta.spineBg,
        ctaLabel: meta.ctaLabel[locale],
        ctaSublabel: meta.ctaSublabel[locale],
        exampleLabel: meta.exampleLabel,
        estimatedTime: meta.estimatedTime[locale],
        focus: meta.focus[locale],
        planKey: plan.fullTitle,
      };
    });
  }, [plans, locale]);

  const handleSelectItem = useCallback(
    (item: DeckItem) => {
      const matched = plans.find(
        (p) => p.code === item.index || p.fullTitle === item.planKey
      );
      onOpenDrawer({
        rubro: matched?.defaultRubro ?? "Local Gastronómico",
        plan: item.planKey,
      });
    },
    [onOpenDrawer, plans]
  );

  return (
    <section
      id="servicios"
      className="relative w-full bg-[#F4F1EA] text-[#050505] pt-20 md:pt-28 pb-12 md:pb-16 selection:bg-[#050505] selection:text-[#F4F1EA]"
    >
      <div className="px-6 sm:px-10 lg:px-28 xl:px-32">
        <div className="mx-auto w-full max-w-[1100px]">
          <div
            ref={headerRef}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 md:mb-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-semibold text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.96] tracking-[-0.03em] text-[#050505] max-w-3xl"
            >
              {locale === "es"
                ? "Tres formas de trabajar juntos."
                : "Three ways we can work together."}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-sans font-medium text-[11px] uppercase tracking-[0.16em] text-[#050505]/60 shrink-0"
            >
              {locale === "es"
                ? "DESLIZÁ PARA APILAR / TOCÁ PARA CONSULTAR"
                : "SCROLL TO STACK / TAP TO INQUIRE"}
            </motion.p>
          </div>
        </div>
      </div>

      <ProjectDeck
        items={deckItems}
        ground="#F4F1EA"
        labels={DECK_LABELS_BY_LOCALE[locale]}
        onSelectItem={handleSelectItem}
      />
    </section>
  );
}
