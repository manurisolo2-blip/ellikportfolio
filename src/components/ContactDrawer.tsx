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
.ellik-drawer-card-idle {
  border: 1px solid rgba(244, 241, 234, 0.15);
  background: linear-gradient(144deg, rgba(244, 241, 234, 0.09), transparent 65%), rgba(28, 28, 34, 0.42);
  box-shadow: inset 0 1px 1px rgba(255, 252, 245, 0.24), inset 0 -1px 1px rgba(0, 0, 0, 0.28);
}
.ellik-drawer-card-idle:hover {
  border-color: rgba(244, 241, 234, 0.28);
  background: linear-gradient(144deg, rgba(244, 241, 234, 0.15), transparent 65%), rgba(38, 38, 46, 0.54);
}
.ellik-drawer-field {
  border: 1px solid rgba(244, 241, 234, 0.17);
  background: linear-gradient(155deg, rgba(244, 241, 234, 0.07), transparent 60%), rgba(22, 22, 27, 0.46);
  box-shadow: inset 0 1px 1px rgba(255, 252, 245, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.34);
  color-scheme: dark;
}
.ellik-drawer-field:focus {
  border-color: rgba(244, 241, 234, 0.62);
  background: linear-gradient(155deg, rgba(244, 241, 234, 0.12), transparent 60%), rgba(34, 34, 42, 0.6);
  box-shadow: inset 0 1px 1px rgba(255, 252, 245, 0.38), 0 0 0 3px rgba(244, 241, 234, 0.1);
}
.ellik-drawer-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(244, 241, 234, 0.18) transparent;
}
`;

const RUBRO_OPTIONS: {
  code: string;
  value: BusinessCategory;
  Icon: LucideIcon;
}[] = [
  { code: "01", value: "Local Gastronómico", Icon: Utensils },
  { code: "02", value: "Tienda de Ropa", Icon: ShoppingBag },
  { code: "03", value: "Institución / Otro", Icon: Building2 },
];

const DRAWER_EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: DRAWER_EASE,
    },
  },
};

const reducedItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18 },
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
            className="fixed inset-0 z-[60]"
          >
            {/* Overlay translúcido para refractar estrellas y secciones detrás del liquid glass */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-[6px]"
            />

            {/* Panel flotante en liquid glass biselado con ángulos rectos (0px) alineado a ELLIK */}
            <motion.aside
              data-lenis-prevent
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { x: 48, scale: 0.98, opacity: 0 }
              }
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { x: 48, scale: 0.98, opacity: 0 }
              }
              transition={{ duration: 0.38, ease: DRAWER_EASE }}
              style={{
                border: "1px solid rgba(244, 241, 234, 0.26)",
                background:
                  "linear-gradient(148deg, rgba(244, 241, 234, 0.15), transparent 24% 74%, rgba(244, 241, 234, 0.07)), rgba(18, 18, 22, 0.58)",
                boxShadow:
                  "inset 1px 1px 1px rgba(255, 252, 245, 0.46), inset -1px -1px 1px rgba(5, 5, 8, 0.45), inset 0 0 14px rgba(244, 241, 234, 0.08), 0 24px 72px rgba(0, 0, 0, 0.62)",
                backdropFilter: "blur(24px) saturate(1.38)",
                WebkitBackdropFilter: "blur(24px) saturate(1.38)",
              }}
              className="ellik-drawer-stage fixed inset-2.5 sm:inset-y-4 sm:right-4 sm:left-auto w-[calc(100%-20px)] sm:w-[min(510px,calc(100vw-32px))] z-10 overflow-hidden flex flex-col text-[#F4F1EA]"
            >
              <motion.div
                className="relative z-10 flex flex-1 min-h-0 flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Barra superior en liquid glass biselado con emblema cuadrado y cierre recto */}
                <div className="shrink-0 px-3.5 pt-3.5 sm:px-7 sm:pt-6 pb-0">
                  <motion.div
                    variants={activeItemVariants}
                    data-drawer-topbar
                    className="px-3.5 py-2.5 flex items-center justify-between border border-[rgba(244,241,234,0.22)] bg-[rgba(244,241,234,0.06)] shadow-[inset_1px_1px_1px_rgba(255,252,245,0.34),inset_-1px_-1px_1px_rgba(0,0,0,0.34)]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        aria-hidden="true"
                        className="w-6 h-6 border border-[rgba(244,241,234,0.34)] bg-[rgba(244,241,234,0.1)] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center shrink-0"
                      >
                        <span className="w-1.5 h-1.5 bg-[#F4F1EA] shadow-[0_0_8px_rgba(244,241,234,0.85)]" />
                      </span>
                      <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.16em] text-[#F4F1EA]/90 truncate">
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
                      className="w-9 h-9 flex items-center justify-center border border-[rgba(244,241,234,0.22)] bg-[rgba(244,241,234,0.08)] hover:bg-[rgba(244,241,234,0.18)] shadow-[inset_1px_1px_1px_rgba(255,252,245,0.28)] text-[#F4F1EA] transition-all cursor-pointer shrink-0"
                    >
                      <X size={15} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </motion.div>
                </div>

                {/* Cuerpo scrolleable equilibrado con bandeja de rubros y campos de cristal */}
                <div
                  data-lenis-prevent
                  className="ellik-drawer-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-3.5 sm:px-7 py-5 flex flex-col justify-between gap-5"
                >
                  <motion.div variants={activeItemVariants}>
                    <h2
                      id="contact-drawer-title"
                      className="font-display font-semibold text-[30px] sm:text-[38px] leading-[1.0] tracking-[-0.022em] [word-spacing:0.04em]"
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

                    <p className="font-sans text-[13.5px] sm:text-[14px] text-[#D4D4D8] mt-2.5 leading-relaxed">
                      {locale === "es"
                        ? "Dejame estos datos y abrimos la charla directo en WhatsApp."
                        : "Share a few details and we'll continue directly on WhatsApp."}
                    </p>

                    {selectedPlan && (
                      <div
                        data-drawer-plan-chip
                        className="inline-flex items-center gap-2 mt-3.5 px-3 py-1.5 border border-[rgba(244,241,234,0.32)] bg-[rgba(244,241,234,0.09)] shadow-[inset_0_1px_1px_rgba(255,252,245,0.28)] font-sans font-medium text-[11px] uppercase tracking-[0.12em] text-[#F4F1EA] max-w-full"
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
                          className="shrink-0 text-[#F4F1EA]/65 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={12} strokeWidth={1.6} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </motion.div>

                  <form
                    onSubmit={handleSendWhatsApp}
                    className="flex flex-col gap-5"
                  >
                    {/* Selector de rubro en bandeja de cristal + tarjetas rectas */}
                    <motion.div variants={activeItemVariants}>
                      <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#F4F1EA]/70 mb-2 block">
                        {locale === "es"
                          ? "Rubro de tu proyecto"
                          : "Project category"}
                      </span>
                      <PresenceContext.Provider value={null}>
                        <LayoutGroup id="contact-rubro-selector">
                          <div
                            data-drawer-rubro-tray
                            className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 border border-[rgba(244,241,234,0.18)] bg-[rgba(244,241,234,0.05)] shadow-[inset_0_1px_1px_rgba(255,252,245,0.24),inset_0_-1px_1px_rgba(0,0,0,0.35)]"
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
                                  className={`min-w-0 p-2 sm:p-3 flex flex-col items-start gap-2.5 text-left transition-all duration-200 relative overflow-hidden cursor-pointer ${
                                    active
                                      ? "border border-transparent text-[#050505]"
                                      : "ellik-drawer-card-idle text-[#D4D4D8] hover:text-white"
                                  }`}
                                >
                                  {active && (
                                    <motion.div
                                      layoutId="activeRubroCard"
                                      transition={{
                                        type: "spring",
                                        stiffness: 440,
                                        damping: 34,
                                      }}
                                      style={{
                                        background:
                                          "radial-gradient(ellipse at 12% -15%, rgba(255, 255, 255, 0.98), transparent 68%), linear-gradient(145deg, rgba(244, 241, 234, 0.96), rgba(220, 214, 203, 0.88))",
                                        border:
                                          "1px solid rgba(255, 255, 255, 0.9)",
                                        boxShadow:
                                          "inset 0 1px 2px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(0, 0, 0, 0.18), 0 10px 24px -6px rgba(244, 241, 234, 0.28)",
                                      }}
                                      className="absolute inset-0"
                                    />
                                  )}

                                  <div className="relative z-10 flex items-center justify-between w-full">
                                    <span
                                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border shrink-0 transition-colors ${
                                        active
                                          ? "bg-[#0B0B0E]/[0.88] border-[#0B0B0E] text-[#F4F1EA] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]"
                                          : "bg-white/[0.08] border-white/[0.18] text-[#F4F1EA]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                                      }`}
                                    >
                                      <Icon
                                        size={14}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                      />
                                    </span>
                                    <span
                                      className={`font-display font-medium text-[10.5px] tracking-[0.06em] ${
                                        active
                                          ? "text-[#050505]/50"
                                          : "text-white/35"
                                      }`}
                                    >
                                      {option.code}
                                    </span>
                                  </div>

                                  <span
                                    data-rubro-label
                                    className={`relative z-10 font-sans text-[11.5px] sm:text-[13px] leading-tight whitespace-nowrap ${
                                      active
                                        ? "font-semibold text-[#050505]"
                                        : "font-medium"
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

                    {/* Campos en cristal biselado */}
                    <motion.div
                      variants={activeItemVariants}
                      className="space-y-3.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="ellik-name"
                            className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#F4F1EA]/70 mb-2 block"
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
                            className="ellik-drawer-field w-full px-3.5 py-3 font-sans text-[13.5px] sm:text-[14px] text-[#F4F1EA] placeholder:text-white/35 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ellik-business"
                            className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#F4F1EA]/70 mb-2 block"
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
                            className="ellik-drawer-field w-full px-3.5 py-3 font-sans text-[13.5px] sm:text-[14px] text-[#F4F1EA] placeholder:text-white/35 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="ellik-need"
                          className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#F4F1EA]/70 mb-2 block"
                        >
                          {locale === "es"
                            ? "¿Qué necesitás resolver hoy? (opcional)"
                            : "What do you need to build? (optional)"}
                        </label>
                        <textarea
                          id="ellik-need"
                          rows={3}
                          value={need}
                          onChange={(e) => setNeed(e.target.value)}
                          placeholder={
                            locale === "es"
                              ? "Ej. Recibir pedidos sin audios eternos los viernes a la noche..."
                              : "e.g. Take direct orders on WhatsApp without back-and-forth messages..."
                          }
                          className="ellik-drawer-field w-full resize-none px-3.5 py-3 font-sans text-[13.5px] sm:text-[14px] text-[#F4F1EA] placeholder:text-white/35 outline-none transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* CTA principal con bisel superior especular */}
                    <motion.div variants={activeItemVariants} className="pt-0.5">
                      <button
                        type="submit"
                        data-drawer-submit
                        data-cursor="action"
                        className="w-full py-3.5 sm:py-4 px-6 bg-[#F4F1EA] hover:bg-white text-[#050505] font-sans font-bold text-[13px] sm:text-[13.5px] uppercase tracking-[0.12em] flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] shadow-[inset_0_1px_1px_#FFFFFF,inset_0_-1px_1px_rgba(0,0,0,0.18),0_12px_30px_-8px_rgba(244,241,234,0.35)] cursor-pointer group"
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
                      <p className="font-sans text-[11px] text-[#71717A] text-center mt-2.5">
                        {locale === "es"
                          ? "Se abre WhatsApp con tu consulta ya redactada · Respuesta directa."
                          : "Opens WhatsApp with your message pre-filled · Direct reply."}
                      </p>
                    </motion.div>
                  </form>
                </div>

                {/* Pie anclado en cristal translúcido */}
                <motion.div
                  variants={activeItemVariants}
                  className="shrink-0 px-3.5 sm:px-7 py-4 border-t border-[rgba(244,241,234,0.14)] bg-[rgba(244,241,234,0.03)] flex items-center justify-between gap-3"
                >
                  <a
                    href={`mailto:${ELLIK_CONFIG.email}`}
                    data-drawer-email-pill
                    className="px-3 py-2 bg-[rgba(244,241,234,0.07)] hover:bg-[rgba(244,241,234,0.13)] border border-[rgba(244,241,234,0.18)] shadow-[inset_0_1px_0_rgba(255,252,245,0.22)] text-[11.5px] sm:text-[12px] font-sans font-medium text-[#F4F1EA]/85 hover:text-white transition-colors truncate min-w-0"
                  >
                    {ELLIK_CONFIG.email}
                  </a>

                  <button
                    type="button"
                    data-drawer-copy-email
                    onClick={handleCopyEmail}
                    className={`px-3.5 py-2 border shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] text-[11px] sm:text-[11.5px] font-sans font-semibold uppercase tracking-[0.12em] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      emailCopied
                        ? "border-[#F4F1EA] bg-[#F4F1EA] text-[#050505]"
                        : "border-[rgba(244,241,234,0.25)] bg-[rgba(244,241,234,0.12)] hover:bg-[rgba(244,241,234,0.2)] text-[#F4F1EA]"
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
