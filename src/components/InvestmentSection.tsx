"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
} from "@/data/ellikData";
import {
  ProjectDeck,
  type DeckItem,
} from "@/components/ui/scroll-stacking-cards";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

const DECK_VISUAL_META: Record<
  string,
  {
    id: string;
    eyebrow: string;
    image: string;
    accent: string;
    ctaLabel: string;
    ctaSublabel: string;
  }
> = {
  "01": {
    id: "pedidos-carta",
    eyebrow: "GASTRONOMÍA / PEDIDOS DIRECTOS A WHATSAPP",
    image: "/previews/mojo-desktop.webp",
    accent: "#E06D3B",
    ctaLabel: "Consultar esta modalidad",
    ctaSublabel: "Charla directa por WhatsApp",
  },
  "02": {
    id: "catalogo-tienda",
    eyebrow: "INDUMENTARIA & COMERCIOS / VENTA DESDE EL CELULAR",
    image: "/previews/dopamine-desktop.webp",
    accent: "#D9A45B",
    ctaLabel: "Consultar esta modalidad",
    ctaSublabel: "Charla directa por WhatsApp",
  },
  "03": {
    id: "desarrollo-medida",
    eyebrow: "INSTITUCIONES & PROYECTOS ESPECIALES / CÓDIGO PROPIO",
    image: "/previews/rio3-desktop.webp",
    accent: "#5B9BD5",
    ctaLabel: "Consultar esta modalidad",
    ctaSublabel: "Charla directa por WhatsApp",
  },
};

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(headerRef, { once: true, margin: "-10%" });

  const deckItems = useMemo<DeckItem[]>(() => {
    return INVESTMENT_PLANS.map((plan) => {
      const meta = DECK_VISUAL_META[plan.code] ?? {
        id: `plan-${plan.code}`,
        eyebrow: plan.defaultRubro.toUpperCase(),
        image: "/previews/mojo-desktop.webp",
        accent: "#E06D3B",
        ctaLabel: "Consultar esta modalidad",
        ctaSublabel: "Charla directa por WhatsApp",
      };

      return {
        id: meta.id,
        index: plan.code,
        name: plan.title,
        eyebrow: meta.eyebrow,
        summary: plan.description,
        deliverables: plan.scopeItems,
        image: meta.image,
        accent: meta.accent,
        ctaLabel: meta.ctaLabel,
        ctaSublabel: meta.ctaSublabel,
        planKey: plan.fullTitle,
      };
    });
  }, []);

  const handleSelectItem = useCallback(
    (item: DeckItem) => {
      const matched = INVESTMENT_PLANS.find(
        (p) => p.code === item.index || p.fullTitle === item.planKey
      );
      onOpenDrawer({
        rubro: matched?.defaultRubro ?? "Local Gastronómico",
        plan: item.planKey,
      });
    },
    [onOpenDrawer]
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
              Tres formas de trabajar juntos.
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
              DESLIZÁ PARA APILAR / TOCÁ PARA CONSULTAR
            </motion.p>
          </div>
        </div>
      </div>

      <ProjectDeck
        items={deckItems}
        ground="#F4F1EA"
        onSelectItem={handleSelectItem}
      />
    </section>
  );
}
