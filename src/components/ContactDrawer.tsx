"use client";

import React, { useEffect, useState } from "react";
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
.ellik-glass-drawer {
  border-radius: 30px;
  border: 1px solid rgba(255, 248, 240, 0.22);
  background: linear-gradient(152deg, rgba(255, 250, 244, 0.14) 0%, rgba(255, 250, 244, 0.03) 34%, rgba(16, 16, 20, 0.56) 100%), rgba(14, 14, 18, 0.58);
  box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.36), inset -1px -1px 1px rgba(0, 0, 0, 0.45), 0 30px 90px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(28px) saturate(1.45);
  -webkit-backdrop-filter: blur(28px) saturate(1.45);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 248, 240, 0.18) transparent;
}
.ellik-glass-drawer .ellik-glass-pill {
  border-radius: 9999px;
}
.ellik-glass-drawer .ellik-glass-tray {
  border-radius: 20px;
}
.ellik-glass-drawer .ellik-glass-tab {
  border-radius: 14px;
}
.ellik-glass-drawer .ellik-glass-field {
  border-radius: 16px;
  color-scheme: dark;
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

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const rubroLabel = RUBRO_COPY[rubro][locale].whatsappLabel;

    const lines =
      locale === "es"
        ? [
            `Hola ELLIK, te escribo desde la web para coordinar un diagnóstico.`,
            `• Rubro: ${rubroLabel}`,
            selectedPlan ? `• Modalidad de interés: ${selectedPlan}` : null,
            name.trim() ? `• Nombre: ${name.trim()}` : null,
            businessAndCity.trim()
              ? `• Negocio y ciudad: ${businessAndCity.trim()}`
              : null,
            need.trim()
              ? `• Qué necesito resolver hoy: ${need.trim()}`
              : null,
          ].filter(Boolean)
        : [
            `Hi ELLIK, I'm reaching out from your website to schedule a review.`,
            `• Category: ${rubroLabel}`,
            selectedPlan ? `• Interested option: ${selectedPlan}` : null,
            name.trim() ? `• Name: ${name.trim()}` : null,
            businessAndCity.trim()
              ? `• Business & city: ${businessAndCity.trim()}`
              : null,
            need.trim() ? `• What I need today: ${need.trim()}` : null,
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
      <style>{DRAWER_SCOPED_CSS}</style>
      <AnimatePresence>
        {isOpen && (
          <div
            key="contact-drawer-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-drawer-title"
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6 pointer-events-none"
          >
            {/* Overlay translúcido para refractar estrellas y secciones detrás del vidrio */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-[8px] pointer-events-auto"
            />

            {/* Panel flotante compacto de vidrio esmerilado real */}
            <motion.aside
              data-lenis-prevent
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
              className="ellik-glass-drawer relative z-10 w-full max-w-[460px] h-auto max-h-[calc(100svh-32px)] overflow-y-auto overflow-x-hidden overscroll-contain text-[#F4F1EA] pointer-events-auto"
            >
              <motion.div
                className="p-6 sm:p-7 flex flex-col gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* A. Cabecera limpia sin barra rectangular encerrada */}
                <motion.div
                  variants={activeItemVariants}
                  className="flex items-center justify-between gap-3"
                >
                  <div
                    data-drawer-topbar
                    className="ellik-glass-pill rounded-full px-3 py-1.5 bg-white/[0.06] border border-white/[0.12] flex items-center gap-2 min-w-0"
                  >
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0"
                    />
                    <span className="font-sans font-medium text-[11px] tracking-[0.06em] text-white/80 truncate">
                      {locale === "es" ? "Contacto directo" : "Direct contact"}
                    </span>
                  </div>

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
                    className="ellik-glass-pill w-9 h-9 rounded-full bg-white/[0.07] hover:bg-white/[0.16] border border-white/[0.16] flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <X size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </motion.div>

                {/* B. Titular directo */}
                <motion.div variants={activeItemVariants}>
                  <h2
                    id="contact-drawer-title"
                    className="font-display font-medium text-[28px] sm:text-[32px] leading-[1.06] tracking-[-0.015em] [word-spacing:0.05em]"
                  >
                    {locale === "es" ? (
                      <>
                        <span className="text-white">Contame sobre</span>{" "}
                        <span className="text-[#F4F1EA]/55">tu negocio.</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white">Tell me about</span>{" "}
                        <span className="text-[#F4F1EA]/55">
                          your business.
                        </span>
                      </>
                    )}
                  </h2>

                  <p className="font-sans text-[13.5px] text-white/60 mt-1.5 leading-snug">
                    {locale === "es"
                      ? "Elegí tu rubro, dejame dos datos y seguimos directo en WhatsApp."
                      : "Pick your category, share two details, and let's chat on WhatsApp."}
                  </p>

                  {selectedPlan && (
                    <div
                      data-drawer-plan-chip
                      className="ellik-glass-pill inline-flex items-center gap-2 mt-2.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-[#1e7461]/30 border border-[#75dac0]/35 text-[#b8f1dd] max-w-full"
                    >
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
                        className="shrink-0 text-[#b8f1dd]/75 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={12} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </motion.div>

                <form
                  onSubmit={handleSendWhatsApp}
                  className="flex flex-col gap-4"
                >
                  {/* C. Selector de Rubro tipo Glass Segmented Control */}
                  <motion.div variants={activeItemVariants}>
                    <span className="font-sans font-medium text-[11px] text-white/55 mb-1.5 ml-1 block">
                      {locale === "es"
                        ? "Rubro de tu proyecto"
                        : "Project category"}
                    </span>
                    <PresenceContext.Provider value={null}>
                      <LayoutGroup id="contact-rubro-selector">
                        <div
                          data-drawer-rubro-tray
                          className="ellik-glass-tray grid grid-cols-3 gap-1.5 p-1.5 rounded-[20px] bg-black/25 border border-white/[0.1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
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
                                className={`ellik-glass-tab relative rounded-[14px] py-3 px-1.5 sm:px-2.5 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-colors min-w-0 ${
                                  active
                                    ? "text-white"
                                    : "bg-transparent hover:bg-white/[0.06] text-white/60 hover:text-white"
                                }`}
                              >
                                {active && (
                                  <motion.div
                                    layoutId="activeGlassTab"
                                    transition={{
                                      type: "spring",
                                      stiffness: 440,
                                      damping: 32,
                                    }}
                                    style={{
                                      background:
                                        "radial-gradient(ellipse at 15% -15%, #3a9381, transparent 70%), linear-gradient(145deg, #1e7461, #0a493e)",
                                      border:
                                        "1px solid rgba(196, 248, 231, 0.48)",
                                      boxShadow:
                                        "inset 0 1px 1px rgba(220, 255, 244, 0.5), 0 6px 16px rgba(8, 68, 58, 0.35)",
                                    }}
                                    className="ellik-glass-tab absolute inset-0 rounded-[14px]"
                                  />
                                )}

                                <Icon
                                  size={16}
                                  strokeWidth={1.75}
                                  className="relative z-10 shrink-0"
                                  aria-hidden="true"
                                />

                                <span
                                  data-rubro-label
                                  className={`relative z-10 font-sans text-[11px] sm:text-[12px] leading-tight whitespace-nowrap ${
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

                  {/* D. Campos de Cristal Suave (rounded-[16px]) */}
                  <motion.div
                    variants={activeItemVariants}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="group">
                        <label
                          htmlFor="ellik-name"
                          className="font-sans font-medium text-[11px] text-white/55 mb-1.5 ml-1 block transition-colors group-focus-within:text-white/85"
                        >
                          {locale === "es" ? "Tu nombre" : "Your name"}
                        </label>
                        <input
                          id="ellik-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={
                            locale === "es"
                              ? "Ej. Martín Gómez"
                              : "e.g. Alex Morgan"
                          }
                          className="ellik-glass-field w-full rounded-[16px] px-3.5 py-2.5 font-sans text-[13.5px] text-white placeholder:text-white/30 bg-white/[0.045] border border-white/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition-all focus:bg-white/[0.08] focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(244,241,234,0.08)]"
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="ellik-business"
                          className="font-sans font-medium text-[11px] text-white/55 mb-1.5 ml-1 block transition-colors group-focus-within:text-white/85"
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
                              ? "Ej. Pizzería Sur — Río Tercero"
                              : "e.g. Mojo Grille — Miami"
                          }
                          className="ellik-glass-field w-full rounded-[16px] px-3.5 py-2.5 font-sans text-[13.5px] text-white placeholder:text-white/30 bg-white/[0.045] border border-white/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition-all focus:bg-white/[0.08] focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(244,241,234,0.08)]"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="ellik-need"
                        className="font-sans font-medium text-[11px] text-white/55 mb-1.5 ml-1 block transition-colors group-focus-within:text-white/85"
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
                            ? "Ej. Recibir pedidos sin audios eternos los viernes a la noche..."
                            : "e.g. Take direct orders on WhatsApp without back-and-forth messages..."
                        }
                        className="ellik-glass-field w-full resize-none rounded-[16px] px-3.5 py-2.5 font-sans text-[13.5px] text-white placeholder:text-white/30 bg-white/[0.045] border border-white/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition-all focus:bg-white/[0.08] focus:border-white/40 focus:shadow-[0_0_0_3px_rgba(244,241,234,0.08)]"
                      />
                    </div>
                  </motion.div>

                  {/* E1. Botón Principal Píldora */}
                  <motion.div variants={activeItemVariants} className="pt-1">
                    <button
                      type="submit"
                      data-drawer-submit
                      data-cursor="action"
                      className="ellik-glass-pill w-full rounded-full py-3.5 px-6 bg-[#F4F1EA] hover:bg-white text-[#0B0B0D] font-sans font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all active:scale-[0.985] shadow-[inset_0_1px_1px_#FFFFFF,0_12px_30px_-8px_rgba(244,241,234,0.35)] cursor-pointer group"
                    >
                      <span>
                        {locale === "es"
                          ? "Continuar en WhatsApp"
                          : "Continue on WhatsApp"}
                      </span>
                      <ArrowUpRight
                        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </motion.div>
                </form>

                {/* E2. Pie ultra limpio integrado */}
                <motion.div
                  variants={activeItemVariants}
                  className="pt-4 border-t border-white/[0.09] flex items-center justify-between gap-3"
                >
                  <a
                    href={`mailto:${ELLIK_CONFIG.email}`}
                    data-drawer-email-pill
                    className="text-[12px] font-sans text-white/55 hover:text-white transition-colors truncate min-w-0"
                  >
                    {ELLIK_CONFIG.email}
                  </a>

                  <button
                    type="button"
                    data-drawer-copy-email
                    onClick={handleCopyEmail}
                    className={`ellik-glass-pill rounded-full px-3 py-1.5 border text-[11.5px] font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      emailCopied
                        ? "bg-[#1e7461]/30 border-[#75dac0]/40 text-[#75dac0]"
                        : "bg-white/[0.06] hover:bg-white/[0.14] border-white/[0.12] text-white/80"
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
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
