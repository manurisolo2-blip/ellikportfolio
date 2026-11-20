"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  PresenceContext,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
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
.ellik-drawer-field {
  color-scheme: dark;
}
.ellik-drawer-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
}
`;

const RUBRO_OPTIONS: {
  code: string;
  value: BusinessCategory;
}[] = [
  { code: "01", value: "Local Gastronómico" },
  { code: "02", value: "Tienda de Ropa" },
  { code: "03", value: "Institución / Otro" },
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
            {/* Overlay oscuro sobrio para contraste uniforme sobre secciones oscuras y claras */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/[0.72] backdrop-blur-[4px]"
            />

            {/* Panel arquitectónico recto y mate alineado a ELLIK */}
            <motion.aside
              data-lenis-prevent
              initial={reducedMotion ? { opacity: 0 } : { x: "100%" }}
              animate={{ x: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.38, ease: DRAWER_EASE }}
              className="fixed inset-y-0 right-0 z-10 flex h-[100dvh] w-full sm:w-[490px] flex-col overflow-hidden bg-[#070709]/[0.96] backdrop-blur-md border-l border-white/[0.14] text-white"
            >
              <motion.div
                className="relative z-10 flex flex-1 min-h-0 flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Barra superior arquitectónica con nodo cuadrado y cierre recto */}
                <motion.div
                  variants={activeItemVariants}
                  data-drawer-topbar
                  className="shrink-0 px-5 sm:px-8 py-5 border-b border-white/[0.1] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 bg-[#F4F1EA] shrink-0"
                    />
                    <span className="font-sans font-medium text-[11px] uppercase tracking-[0.18em] text-white/65 truncate">
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
                    className="border border-white/20 bg-transparent hover:border-white px-3.5 h-9 inline-flex items-center gap-2 font-sans font-medium text-[10.5px] uppercase tracking-[0.16em] text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <span>{locale === "es" ? "Cerrar" : "Close"}</span>
                    <X size={13} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </motion.div>

                {/* Cuerpo scrolleable con ritmo continuo y cero vacío muerto */}
                <div
                  data-lenis-prevent
                  className="ellik-drawer-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-5 sm:px-8 py-6 sm:py-7 flex flex-col gap-6 sm:gap-7"
                >
                  <motion.div variants={activeItemVariants}>
                    <h2
                      id="contact-drawer-title"
                      className="font-display font-medium text-[30px] sm:text-[36px] leading-[1.03] tracking-[-0.02em] [word-spacing:0.04em]"
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

                    <p className="font-sans text-[13.5px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                      {locale === "es"
                        ? "Dejame estos datos y abrimos la charla directo en WhatsApp."
                        : "Share a few details and we'll continue directly on WhatsApp."}
                    </p>

                    {selectedPlan && (
                      <div
                        data-drawer-plan-chip
                        className="inline-flex items-center gap-2.5 mt-4 px-3 py-1.5 border border-[#F4F1EA]/30 bg-white/[0.04] font-sans font-medium text-[11px] uppercase tracking-[0.12em] text-[#F4F1EA] max-w-full"
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
                    className="flex flex-col gap-5 sm:gap-6"
                  >
                    {/* Selector editorial numerado (01, 02, 03) sin íconos ni brillos */}
                    <motion.div variants={activeItemVariants}>
                      <span className="font-sans font-medium text-[10.5px] uppercase tracking-[0.16em] text-[#A1A1AA] mb-2.5 block">
                        {locale === "es"
                          ? "Rubro de tu proyecto"
                          : "Project category"}
                      </span>
                      <PresenceContext.Provider value={null}>
                        <LayoutGroup id="contact-rubro-selector">
                          <div
                            data-drawer-rubro-tray
                            className="grid grid-cols-3 gap-2"
                          >
                            {RUBRO_OPTIONS.map((option) => {
                              const active = rubro === option.value;
                              const label =
                                RUBRO_COPY[option.value][locale].cardLabel;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  data-drawer-rubro={option.value}
                                  aria-pressed={active}
                                  onClick={() => setRubro(option.value)}
                                  className={`min-w-0 p-3 sm:p-3.5 flex flex-col items-start gap-2.5 text-left border transition-colors duration-200 relative overflow-hidden cursor-pointer ${
                                    active
                                      ? "border-[#F4F1EA] text-[#050505]"
                                      : "border-white/[0.14] bg-[#0D0D0F] text-white/70 hover:border-white/40 hover:text-white"
                                  }`}
                                >
                                  {active && (
                                    <motion.div
                                      layoutId="activeRubro"
                                      transition={{
                                        type: "spring",
                                        stiffness: 460,
                                        damping: 36,
                                      }}
                                      className="absolute inset-0 bg-[#F4F1EA]"
                                    />
                                  )}

                                  <span
                                    className={`relative z-10 font-sans font-medium text-[10px] tabular-nums tracking-[0.16em] ${
                                      active
                                        ? "text-[#050505]/55"
                                        : "text-white/40"
                                    }`}
                                  >
                                    {option.code}
                                  </span>

                                  <span
                                    data-rubro-label
                                    className={`relative z-10 font-sans text-[12px] sm:text-[13px] leading-tight whitespace-nowrap ${
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

                    {/* Campos rectos y mate en Satoshi */}
                    <motion.div
                      variants={activeItemVariants}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label
                            htmlFor="ellik-name"
                            className="font-sans font-medium text-[10.5px] uppercase tracking-[0.16em] text-[#A1A1AA] mb-2 block"
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
                            className="ellik-drawer-field w-full border border-white/[0.14] bg-[#0D0D0F] px-3.5 py-3 font-sans text-[14px] text-white placeholder:text-white/30 outline-none transition-colors duration-200 focus:border-[#F4F1EA] focus:bg-[#121215]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ellik-business"
                            className="font-sans font-medium text-[10.5px] uppercase tracking-[0.16em] text-[#A1A1AA] mb-2 block"
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
                            className="ellik-drawer-field w-full border border-white/[0.14] bg-[#0D0D0F] px-3.5 py-3 font-sans text-[14px] text-white placeholder:text-white/30 outline-none transition-colors duration-200 focus:border-[#F4F1EA] focus:bg-[#121215]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="ellik-need"
                          className="font-sans font-medium text-[10.5px] uppercase tracking-[0.16em] text-[#A1A1AA] mb-2 block"
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
                          className="ellik-drawer-field w-full resize-none border border-white/[0.14] bg-[#0D0D0F] px-3.5 py-3 font-sans text-[14px] text-white placeholder:text-white/30 outline-none transition-colors duration-200 focus:border-[#F4F1EA] focus:bg-[#121215]"
                        />
                      </div>
                    </motion.div>

                    {/* CTA principal recto sin sombra ni brillo */}
                    <motion.div variants={activeItemVariants} className="pt-0.5">
                      <button
                        type="submit"
                        data-drawer-submit
                        data-cursor="action"
                        className="w-full py-4 px-6 bg-[#F4F1EA] hover:bg-white text-[#050505] font-sans font-semibold text-[12px] uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 transition-colors duration-200 active:scale-[0.99] cursor-pointer group"
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

                {/* Pie anclado sobrio y recto */}
                <motion.div
                  variants={activeItemVariants}
                  className="shrink-0 px-5 sm:px-8 py-4 border-t border-white/[0.1] bg-[#070709] flex items-center justify-between gap-3"
                >
                  <a
                    href={`mailto:${ELLIK_CONFIG.email}`}
                    data-drawer-email-pill
                    className="font-sans text-xs tracking-[0.02em] text-white/65 hover:text-white transition-colors truncate min-w-0"
                  >
                    {ELLIK_CONFIG.email}
                  </a>

                  <button
                    type="button"
                    data-drawer-copy-email
                    onClick={handleCopyEmail}
                    className={`border px-3.5 py-2 font-sans font-medium text-[10.5px] uppercase tracking-[0.14em] transition-colors cursor-pointer shrink-0 ${
                      emailCopied
                        ? "border-[#F4F1EA] bg-[#F4F1EA] text-[#050505]"
                        : "border-white/20 bg-transparent text-white/80 hover:border-white hover:text-white"
                    }`}
                  >
                    {emailCopied
                      ? locale === "es"
                        ? "Copiado"
                        : "Copied"
                      : locale === "es"
                        ? "Copiar mail"
                        : "Copy email"}
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
