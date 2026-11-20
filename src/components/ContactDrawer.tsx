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
.ellik-glass-drawer {
  border: 1px solid rgba(255, 248, 240, 0.24);
  background: linear-gradient(152deg, rgba(255, 250, 244, 0.14) 0%, rgba(255, 250, 244, 0.03) 34%, rgba(16, 16, 20, 0.56) 100%), rgba(14, 14, 18, 0.58);
  box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.38), inset -1px -1px 1px rgba(0, 0, 0, 0.45), 0 30px 90px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(28px) saturate(1.45);
  -webkit-backdrop-filter: blur(28px) saturate(1.45);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 248, 240, 0.18) transparent;
}
.ellik-glass-tray {
  --mx: 32%;
  --my: 24%;
}
.ellik-liquid-indicator {
  background:
    radial-gradient(
      circle at var(--mx, 32%) var(--my, 24%),
      rgba(255, 255, 255, 0.46),
      rgba(226, 234, 248, 0.18) 54%,
      rgba(110, 126, 158, 0.24) 100%
    ),
    linear-gradient(145deg, rgba(255, 255, 255, 0.22), rgba(244, 241, 234, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.44);
  box-shadow:
    inset 1px 1px 1px rgba(255, 255, 255, 0.68),
    inset -1px -1px 1px rgba(10, 14, 24, 0.38),
    inset 0 0 14px rgba(255, 255, 255, 0.16),
    0 10px 26px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
}
.ellik-liquid-morph {
  animation: ellik-meniscus 0.46s cubic-bezier(0.22, 1.32, 0.36, 1);
  transform-origin: center;
}
.ellik-liquid-ripple {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(226, 234, 248, 0.18) 45%,
    transparent 74%
  );
  animation: ellik-caustic-wave 0.56s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.ellik-glass-field {
  color-scheme: dark;
  transition:
    background 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.ellik-glass-field:hover:not(:focus) {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.22);
}
.ellik-glass-field:focus {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow:
    inset 1px 1px 1px rgba(255, 255, 255, 0.42),
    0 0 0 3px rgba(255, 255, 255, 0.09),
    0 10px 24px -8px rgba(0, 0, 0, 0.45);
}
@keyframes ellik-meniscus {
  0% {
    transform: scale(1.08, 0.92);
  }
  48% {
    transform: scale(0.97, 1.03);
  }
  100% {
    transform: scale(1, 1);
  }
}
@keyframes ellik-caustic-wave {
  0% {
    opacity: 0.8;
    transform: scale(0.45);
  }
  100% {
    opacity: 0;
    transform: scale(1.55);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ellik-liquid-morph,
  .ellik-liquid-ripple {
    animation: none;
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
  const [rippleKey, setRippleKey] = useState<number>(0);
  const [isMorphing, setIsMorphing] = useState<boolean>(false);

  const trayRef = useRef<HTMLDivElement | null>(null);
  const morphTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (isOpen) {
      setRubro(initialRubro);
      setSelectedPlan(initialPlan);
      setIsMorphing(false);
    }
  }, [isOpen, initialRubro, initialPlan]);

  useEffect(() => {
    return () => {
      if (morphTimerRef.current) {
        clearTimeout(morphTimerRef.current);
      }
    };
  }, []);

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

  const handleSelectRubro = (nextValue: BusinessCategory) => {
    if (nextValue !== rubro) {
      setRubro(nextValue);
      setRippleKey((prev) => prev + 1);
      setIsMorphing(true);
      if (morphTimerRef.current) {
        clearTimeout(morphTimerRef.current);
      }
      morphTimerRef.current = setTimeout(() => {
        setIsMorphing(false);
      }, 460);
    }
  };

  const handleTrayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const tray = trayRef.current;
    if (!tray) return;
    const rect = tray.getBoundingClientRect();
    const xPct = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100)
    );
    const yPct = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100)
    );
    tray.style.setProperty("--mx", `${xPct.toFixed(1)}%`);
    tray.style.setProperty("--my", `${yPct.toFixed(1)}%`);
  };

  const handleTrayPointerLeave = () => {
    const tray = trayRef.current;
    if (!tray) return;
    tray.style.setProperty("--mx", "32%");
    tray.style.setProperty("--my", "24%");
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

            {/* Panel flotante compacto de vidrio esmerilado con ángulos rectos */}
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
                {/* Cabecera limpia sin punto indicador ni barra cerrada */}
                <motion.div
                  variants={activeItemVariants}
                  className="flex items-center justify-between gap-3"
                >
                  <div
                    data-drawer-topbar
                    className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.14] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.22)] flex items-center min-w-0"
                  >
                    <span className="font-sans font-medium text-[11px] uppercase tracking-[0.12em] text-white/85 truncate">
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
                    className="w-9 h-9 bg-white/[0.07] hover:bg-white/[0.16] border border-white/[0.18] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.24)] flex items-center justify-center text-white/85 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <X size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </motion.div>

                {/* Titular directo */}
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
                      ? "Elegí tu rubro, dejame dos datos y seguimos directo en WhatsApp"
                      : "Pick your category, share two details, and let's chat on WhatsApp"}
                  </p>

                  {selectedPlan && (
                    <div
                      data-drawer-plan-chip
                      className="inline-flex items-center gap-2 mt-2.5 px-3 py-1 text-[11px] font-sans font-medium bg-white/[0.14] border border-white/[0.34] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4)] text-white max-w-full"
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
                        className="shrink-0 text-white/75 hover:text-white transition-colors cursor-pointer"
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
                  {/* Selector de rubro con física y refracción de cristal líquido */}
                  <motion.div variants={activeItemVariants}>
                    <span className="font-sans font-medium text-[11px] text-white/55 mb-1.5 block">
                      {locale === "es"
                        ? "Rubro de tu proyecto"
                        : "Project category"}
                    </span>
                    <PresenceContext.Provider value={null}>
                      <LayoutGroup id="contact-rubro-selector">
                        <div
                          ref={trayRef}
                          data-drawer-rubro-tray
                          onPointerMove={handleTrayPointerMove}
                          onPointerLeave={handleTrayPointerLeave}
                          className="ellik-glass-tray grid grid-cols-3 gap-1.5 p-1.5 bg-black/30 border border-white/[0.12] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
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
                                onClick={() => handleSelectRubro(option.value)}
                                className={`relative py-3 px-1.5 sm:px-2.5 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-colors duration-200 min-w-0 ${
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
                                      stiffness: 320,
                                      damping: 24,
                                      mass: 0.75,
                                    }}
                                    className={`ellik-liquid-indicator absolute inset-0 overflow-hidden ${
                                      isMorphing ? "ellik-liquid-morph" : ""
                                    }`}
                                  >
                                    {rippleKey > 0 && (
                                      <span
                                        key={rippleKey}
                                        aria-hidden="true"
                                        className="ellik-liquid-ripple pointer-events-none absolute inset-0"
                                      />
                                    )}
                                  </motion.div>
                                )}

                                <motion.span
                                  aria-hidden="true"
                                  animate={
                                    active && !reducedMotion
                                      ? { scale: 1.08, y: -1 }
                                      : { scale: 1, y: 0 }
                                  }
                                  transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 20,
                                  }}
                                  className="relative z-10 inline-flex shrink-0"
                                >
                                  <Icon size={16} strokeWidth={1.75} />
                                </motion.span>

                                <span
                                  data-rubro-label
                                  className={`relative z-10 font-sans text-[11px] sm:text-[12px] leading-tight whitespace-nowrap ${
                                    active
                                      ? "font-semibold text-white"
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

                  {/* Campos rectos de cristal líquido */}
                  <motion.div
                    variants={activeItemVariants}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="group">
                        <label
                          htmlFor="ellik-name"
                          className="font-sans font-medium text-[11px] text-white/55 mb-1.5 block transition-colors group-focus-within:text-white/90"
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
                          className="ellik-glass-field w-full px-3.5 py-2.5 font-sans text-[13.5px] text-white placeholder:text-white/30 bg-white/[0.045] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none"
                        />
                      </div>

                      <div className="group">
                        <label
                          htmlFor="ellik-business"
                          className="font-sans font-medium text-[11px] text-white/55 mb-1.5 block transition-colors group-focus-within:text-white/90"
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
                          className="ellik-glass-field w-full px-3.5 py-2.5 font-sans text-[13.5px] text-white placeholder:text-white/30 bg-white/[0.045] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label
                        htmlFor="ellik-need"
                        className="font-sans font-medium text-[11px] text-white/55 mb-1.5 block transition-colors group-focus-within:text-white/90"
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
                        className="ellik-glass-field w-full resize-none px-3.5 py-2.5 font-sans text-[13.5px] text-white placeholder:text-white/30 bg-white/[0.045] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none"
                      />
                    </div>
                  </motion.div>

                  {/* Botón principal recto con brillo especular */}
                  <motion.div variants={activeItemVariants} className="pt-1">
                    <button
                      type="submit"
                      data-drawer-submit
                      data-cursor="action"
                      className="w-full py-3.5 px-6 bg-[#F4F1EA] hover:bg-white text-[#0B0B0D] font-sans font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all active:scale-[0.985] shadow-[inset_0_1px_1px_#FFFFFF,0_12px_30px_-8px_rgba(244,241,234,0.35)] cursor-pointer group"
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

                {/* Pie compacto */}
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
                    className={`px-3 py-1.5 border text-[11.5px] font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      emailCopied
                        ? "border-white/45 bg-white/[0.18] text-white shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]"
                        : "bg-white/[0.06] hover:bg-white/[0.14] border-white/[0.14] text-white/80"
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
