"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  PresenceContext,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Check,
  Copy,
  ShoppingBag,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ELLIK_CONFIG,
  RUBRO_COPY,
  type BusinessCategory,
} from "@/data/ellikData";
import { useLanguage } from "@/context/LanguageContext";

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRubro?: BusinessCategory;
  initialPlan?: string;
}

const DRAWER_SCOPED_CSS = `
.ellik-liquid-panel {
  --gx: 24%;
  --gy: 14%;
  position: relative;
  isolation: isolate;
  border-radius: 32px !important;
  background: linear-gradient(
    155deg,
    rgba(24, 26, 32, 0.64) 0%,
    rgba(14, 15, 19, 0.74) 40%,
    rgba(8, 9, 12, 0.82) 100%
  );
  backdrop-filter: blur(36px) saturate(165%) brightness(0.84);
  -webkit-backdrop-filter: blur(36px) saturate(165%) brightness(0.84);
  box-shadow:
    inset 0 1.5px 1px rgba(255, 255, 255, 0.42),
    inset 0 -1px 2px rgba(255, 255, 255, 0.08),
    inset 1px 0 1px rgba(255, 255, 255, 0.14),
    0 32px 90px -12px rgba(0, 0, 0, 0.72);
}
.ellik-liquid-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1.25px;
  border-radius: 32px !important;
  pointer-events: none;
  z-index: 20;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.62) 0%,
    rgba(255, 255, 255, 0.14) 26%,
    rgba(244, 241, 234, 0.08) 55%,
    rgba(255, 255, 255, 0.28) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
.ellik-liquid-panel .ellik-liquid-glare {
  border-radius: 32px !important;
  background: radial-gradient(
    280px circle at var(--gx) var(--gy),
    rgba(255, 255, 255, 0.11),
    rgba(244, 241, 234, 0.03) 45%,
    transparent 72%
  );
  mix-blend-mode: screen;
}
.ellik-liquid-panel .ellik-liquid-caustics {
  border-radius: 32px !important;
  background:
    radial-gradient(240px circle at 10% 8%, rgba(244, 241, 234, 0.07), transparent 70%),
    radial-gradient(280px circle at 92% 94%, rgba(244, 241, 234, 0.05), transparent 72%);
}
.ellik-liquid-panel .ellik-thin-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}
.ellik-liquid-panel .ellik-liquid-pill,
.ellik-liquid-panel .ellik-liquid-dot {
  border-radius: 9999px !important;
}
.ellik-liquid-panel .ellik-liquid-rail {
  border-radius: 22px !important;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.12);
}
.ellik-liquid-panel .ellik-liquid-tab {
  border-radius: 16px !important;
}
.ellik-liquid-panel .ellik-liquid-lens {
  border-radius: 16px !important;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.09) 48%,
    rgba(255, 255, 255, 0.04) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow:
    inset 0 1.5px 1px rgba(255, 255, 255, 0.72),
    inset 0 -1px 3px rgba(0, 0, 0, 0.35),
    0 8px 20px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
}
.ellik-liquid-panel .ellik-liquid-field {
  border-radius: 16px !important;
  background: rgba(4, 5, 8, 0.64);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.55),
    0 1px 0 rgba(255, 255, 255, 0.14);
  color-scheme: dark;
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.ellik-liquid-panel .ellik-liquid-field:hover:not(:focus) {
  background: rgba(6, 8, 11, 0.72);
  border-color: rgba(255, 255, 255, 0.28);
}
.ellik-liquid-panel .ellik-liquid-field:focus {
  background: rgba(8, 10, 14, 0.78);
  border-color: rgba(255, 255, 255, 0.48);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(255, 255, 255, 0.08);
}
.ellik-liquid-panel .ellik-liquid-cta {
  position: relative;
  overflow: hidden;
  border-radius: 9999px !important;
  box-shadow:
    inset 0 1.5px 1px rgba(255, 255, 255, 0.45),
    inset 0 -2px 4px rgba(0, 0, 0, 0.18),
    0 14px 32px -12px rgba(0, 0, 0, 0.55);
}
.ellik-liquid-panel .ellik-cta-sheen {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 55%;
  transform: translateX(-160%) skewX(-20deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.72),
    transparent
  );
  pointer-events: none;
}
.ellik-liquid-panel .ellik-liquid-cta:hover .ellik-cta-sheen {
  transform: translateX(280%) skewX(-20deg);
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .ellik-liquid-panel .ellik-cta-sheen {
    display: none;
  }
}
`;

const RUBRO_OPTIONS: {
  value: BusinessCategory;
  Icon: LucideIcon;
}[] = [
  { value: "Local Gastronómico", Icon: Utensils },
  { value: "Tienda de Ropa", Icon: ShoppingBag },
  { value: "Institución / Otro", Icon: Building2 },
];

const DRAWER_EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: DRAWER_EASE,
    },
  },
};

const reducedItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.16 },
  },
};

export function ContactDrawer({
  isOpen,
  onClose,
  initialRubro = "Local Gastronómico",
  initialPlan = "",
}: ContactDrawerProps) {
  const { locale } = useLanguage();
  const [rubro, setRubro] = useState<BusinessCategory>(initialRubro);
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [name, setName] = useState<string>("");
  const [businessAndCity, setBusinessAndCity] = useState<string>("");
  const [need, setNeed] = useState<string>("");
  const [emailCopied, setEmailCopied] = useState<boolean>(false);

  const panelRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (isOpen) {
      setRubro(initialRubro);
      setSelectedPlan(initialPlan);
    }
  }, [isOpen, initialRubro, initialPlan]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handlePanelPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const xPct = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100)
    );
    const yPct = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100)
    );
    panel.style.setProperty("--gx", `${xPct.toFixed(1)}%`);
    panel.style.setProperty("--gy", `${yPct.toFixed(1)}%`);
  };

  const handlePanelPointerLeave = () => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.setProperty("--gx", "24%");
    panel.style.setProperty("--gy", "14%");
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const rubroLabel = RUBRO_COPY[rubro][locale].whatsappLabel;

    const lines =
      locale === "es"
        ? [
            `Hola ELLIK, te escribo desde la web para coordinar un diagnóstico.`,
            `- Rubro: ${rubroLabel}`,
            selectedPlan ? `- Modalidad de interés: ${selectedPlan}` : null,
            name.trim() ? `- Nombre: ${name.trim()}` : null,
            businessAndCity.trim()
              ? `- Negocio y ciudad: ${businessAndCity.trim()}`
              : null,
            need.trim()
              ? `- Qué necesito resolver hoy: ${need.trim()}`
              : null,
          ].filter(Boolean)
        : [
            `Hi ELLIK, I'm reaching out from your website to schedule a review.`,
            `- Category: ${rubroLabel}`,
            selectedPlan ? `- Interested option: ${selectedPlan}` : null,
            name.trim() ? `- Name: ${name.trim()}` : null,
            businessAndCity.trim()
              ? `- Business & city: ${businessAndCity.trim()}`
              : null,
            need.trim() ? `- What I need today: ${need.trim()}` : null,
          ].filter(Boolean);

    const whatsappUrl = `https://wa.me/${
      ELLIK_CONFIG.whatsappNumber
    }?text=${encodeURIComponent(lines.join("\n"))}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ELLIK_CONFIG.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${ELLIK_CONFIG.email}`;
    }
  };

  const activeItemVariants = reducedMotion ? reducedItemVariants : itemVariants;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DRAWER_SCOPED_CSS }} />
      <AnimatePresence>
        {isOpen && (
          <div
            key="contact-drawer-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-drawer-title"
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 pointer-events-none"
          >
            {/* Overlay limpio para que la escena y estrellas se refracten a través del vidrio */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/35 backdrop-blur-[6px] pointer-events-auto"
            />

            {/* Panel flotante óptico de vidrio líquido con borde Fresnel y glare reactivo */}
            <motion.aside
              ref={panelRef}
              data-lenis-prevent
              onPointerMove={handlePanelPointerMove}
              onPointerLeave={handlePanelPointerLeave}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { x: 40, scale: 0.97, opacity: 0 }
              }
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { x: 40, scale: 0.97, opacity: 0 }
              }
              transition={{ duration: 0.36, ease: DRAWER_EASE }}
              className="ellik-liquid-panel relative z-10 w-full max-w-[468px] h-auto max-h-[calc(100svh-32px)] overflow-hidden text-[#F4F1EA] pointer-events-auto"
            >
              {/* Capas ópticas internas: cáustica ambiental + brillo líquido al puntero */}
              <div
                aria-hidden="true"
                className="ellik-liquid-caustics pointer-events-none absolute inset-0 z-0"
              />
              <div
                aria-hidden="true"
                className="ellik-liquid-glare pointer-events-none absolute inset-0 z-[1]"
              />

              <div
                data-lenis-prevent
                className="ellik-thin-scroll relative z-10 max-h-[calc(100svh-32px)] overflow-y-auto overflow-x-hidden overscroll-contain"
              >
                <motion.div
                  className="p-6 sm:p-7 flex flex-col gap-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* A. Cabecera directa: titular + gota circular de cierre */}
                  <motion.div variants={activeItemVariants}>
                    <div className="flex items-start justify-between gap-4">
                      <h2
                        id="contact-drawer-title"
                        className="font-display font-semibold text-[32px] sm:text-[36px] leading-[1.03] tracking-[-0.02em] [word-spacing:0.04em]"
                      >
                        {locale === "es" ? (
                          <>
                            <span className="text-white">Contame sobre</span>{" "}
                            <span className="text-white/85">tu negocio.</span>
                          </>
                        ) : (
                          <>
                            <span className="text-white">Tell me about</span>{" "}
                            <span className="text-white/85">
                              your business.
                            </span>
                          </>
                        )}
                      </h2>

                      <button
                        type="button"
                        data-drawer-close
                        data-cursor="action"
                        aria-label={
                          locale === "es"
                            ? "Cerrar panel de contacto"
                            : "Close contact panel"
                        }
                        onClick={onClose}
                        className="ellik-liquid-pill w-10 h-10 bg-white/[0.09] hover:bg-white/[0.18] border border-white/[0.24] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        <X size={16} strokeWidth={1.9} aria-hidden="true" />
                      </button>
                    </div>

                    <p className="font-sans font-medium text-[14.5px] sm:text-[15px] text-white/90 mt-2.5 leading-snug">
                      {locale === "es"
                        ? "Elegí tu rubro, dejame dos datos y seguimos directo en WhatsApp."
                        : "Pick your category, share two details, and let's chat on WhatsApp."}
                    </p>

                    {selectedPlan && (
                      <div
                        data-drawer-plan-chip
                        className="ellik-liquid-pill inline-flex items-center gap-2 mt-2.5 px-3 py-1 text-[12px] font-sans font-medium bg-white/[0.12] border border-white/[0.24] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] text-white max-w-full"
                      >
                        <span
                          aria-hidden="true"
                          className="ellik-liquid-dot w-1.5 h-1.5 bg-[var(--accent-signal)] shrink-0"
                        />
                        <span className="truncate">
                          {locale === "es" ? "Modalidad" : "Option"}:{" "}
                          {selectedPlan}
                        </span>
                        <button
                          type="button"
                          aria-label={
                            locale === "es"
                              ? "Quitar modalidad"
                              : "Remove option"
                          }
                          onClick={() => setSelectedPlan("")}
                          className="shrink-0 text-white/80 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={13} strokeWidth={1.9} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </motion.div>

                  <form
                    onSubmit={handleSendWhatsApp}
                    className="flex flex-col gap-4"
                  >
                    {/* B. Selector de Rubro: Riel hundido + lente convexa deslizante */}
                    <motion.div variants={activeItemVariants}>
                      <span className="font-sans font-semibold text-[12.5px] sm:text-[13px] text-white/95 mb-2 ml-1 block">
                        {locale === "es"
                          ? "Rubro de tu proyecto"
                          : "Project category"}
                      </span>
                      <PresenceContext.Provider value={null}>
                        <LayoutGroup id="contact-rubro-selector">
                          <div
                            data-drawer-rubro-tray
                            className="ellik-liquid-rail grid grid-cols-3 gap-1.5 p-1.5"
                          >
                            {RUBRO_OPTIONS.map((option) => {
                              const active = rubro === option.value;
                              const Icon = option.Icon;
                              const label =
                                RUBRO_COPY[option.value][locale].cardLabel;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  data-drawer-rubro={option.value}
                                  aria-pressed={active}
                                  onClick={() => setRubro(option.value)}
                                  className={`ellik-liquid-tab relative py-3 px-1.5 sm:px-2.5 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-colors min-w-0 ${
                                    active
                                      ? "text-white"
                                      : "bg-transparent text-white/80 hover:text-white"
                                  }`}
                                >
                                  {active && (
                                    <motion.div
                                      layoutId="liquidRubroLens"
                                      transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 32,
                                      }}
                                      className="ellik-liquid-lens absolute inset-0 overflow-hidden pointer-events-none"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[62%] h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                                      />
                                    </motion.div>
                                  )}

                                  <Icon
                                    size={18}
                                    strokeWidth={1.8}
                                    className={
                                      active
                                        ? "relative z-10 shrink-0 text-[var(--accent-signal)]"
                                        : "relative z-10 shrink-0"
                                    }
                                    aria-hidden="true"
                                  />

                                  <span
                                    data-rubro-label
                                    className={`relative z-10 font-sans text-[12px] sm:text-[13.5px] leading-tight whitespace-nowrap ${
                                      active ? "font-semibold" : "font-medium"
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </LayoutGroup>
                      </PresenceContext.Provider>
                    </motion.div>

                    {/* C. Inputs tallados en el vidrio (Carved Glass) */}
                    <motion.div
                      variants={activeItemVariants}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="group">
                          <label
                            htmlFor="ellik-name"
                            className="font-sans font-semibold text-[12.5px] sm:text-[13px] text-white/95 mb-2 ml-1 block transition-colors group-focus-within:text-white"
                          >
                            {locale === "es" ? "Tu nombre" : "Your name"}
                          </label>
                          <input
                            id="ellik-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={
                              locale === "es" ? "Martín Gómez" : "Alex Morgan"
                            }
                            className="ellik-liquid-field w-full px-4 py-3 font-sans font-medium text-[14.5px] sm:text-[15px] text-white placeholder:text-white/55 outline-none"
                          />
                        </div>

                        <div className="group">
                          <label
                            htmlFor="ellik-business"
                            className="font-sans font-semibold text-[12.5px] sm:text-[13px] text-white/95 mb-2 ml-1 block transition-colors group-focus-within:text-white"
                          >
                            {locale === "es"
                              ? "Negocio y ciudad"
                              : "Business & city"}
                          </label>
                          <input
                            id="ellik-business"
                            type="text"
                            value={businessAndCity}
                            onChange={(e) => setBusinessAndCity(e.target.value)}
                            placeholder={
                              locale === "es"
                                ? "Pizzería Sur — Río Tercero"
                                : "Mojo Grille — Miami"
                            }
                            className="ellik-liquid-field w-full px-4 py-3 font-sans font-medium text-[14.5px] sm:text-[15px] text-white placeholder:text-white/55 outline-none"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label
                          htmlFor="ellik-need"
                          className="font-sans font-semibold text-[12.5px] sm:text-[13px] text-white/95 mb-2 ml-1 block transition-colors group-focus-within:text-white"
                        >
                          {locale === "es"
                            ? "¿Qué necesitás resolver? (opcional)"
                            : "What do you need to solve? (optional)"}
                        </label>
                        <textarea
                          id="ellik-need"
                          rows={2}
                          value={need}
                          onChange={(e) => setNeed(e.target.value)}
                          placeholder={
                            locale === "es"
                              ? "Recibir pedidos sin audios eternos los viernes a la noche"
                              : "Take direct orders on WhatsApp without back-and-forth messages"
                          }
                          className="ellik-liquid-field w-full resize-none px-4 py-3 font-sans font-medium text-[14.5px] sm:text-[15px] text-white placeholder:text-white/55 outline-none"
                        />
                      </div>
                    </motion.div>

                    {/* D1. CTA principal píldora señal con destello único */}
                    <motion.div variants={activeItemVariants} className="pt-1">
                      <button
                        type="submit"
                        data-drawer-submit
                        data-cursor="action"
                        className="ellik-liquid-cta w-full py-3.5 px-6 bg-[var(--accent-signal)] hover:brightness-110 text-[var(--accent-signal-ink)] font-sans font-bold text-[14.5px] sm:text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.985] cursor-pointer group"
                      >
                        <span aria-hidden="true" className="ellik-cta-sheen" />
                        <span className="relative z-10">
                          {locale === "es"
                            ? "Continuar en WhatsApp"
                            : "Continue on WhatsApp"}
                        </span>
                        <ArrowUpRight
                          className="relative z-10 size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    </motion.div>
                  </form>

                  {/* D2. Pie limpio */}
                  <motion.div
                    variants={activeItemVariants}
                    className="pt-4 border-t border-white/[0.14] flex items-center justify-between gap-3"
                  >
                    <a
                      href={`mailto:${ELLIK_CONFIG.email}`}
                      data-drawer-email-pill
                      className="text-[13.5px] sm:text-[14px] font-sans font-medium text-white/90 hover:text-white transition-colors truncate min-w-0"
                    >
                      {ELLIK_CONFIG.email}
                    </a>

                    <button
                      type="button"
                      data-drawer-copy-email
                      onClick={handleCopyEmail}
                      className={`ellik-liquid-pill px-3.5 py-2 border text-[12.5px] sm:text-[13px] font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        emailCopied
                          ? "bg-[var(--accent-signal)] border-[var(--accent-signal)] text-[var(--accent-signal-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
                          : "bg-white/[0.1] hover:bg-white/[0.18] border-white/[0.24] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] text-white"
                      }`}
                    >
                      {emailCopied ? (
                        <>
                          <Check size={12} aria-hidden="true" />
                          <span>{locale === "es" ? "Copiado" : "Copied"}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} aria-hidden="true" />
                          <span>
                            {locale === "es" ? "Copiar mail" : "Copy email"}
                          </span>
                        </>
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
