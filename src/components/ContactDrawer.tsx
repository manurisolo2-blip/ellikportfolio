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
import { ELLIK_CONFIG, type BusinessCategory } from "@/data/ellikData";

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRubro?: BusinessCategory;
  initialPlan?: string;
}

const DRAWER_SCOPED_CSS = `
.ellik-drawer-stage {
  border-radius: 28px !important;
}
@media (min-width: 640px) {
  .ellik-drawer-stage {
    border-radius: 34px !important;
  }
}
.ellik-drawer-pill {
  border-radius: 9999px !important;
}
.ellik-drawer-tray {
  border-radius: 20px !important;
}
.ellik-drawer-card {
  border-radius: 14px !important;
}
.ellik-drawer-card-idle {
  border: 1px solid rgba(255, 240, 224, 0.14);
  background: linear-gradient(144deg, rgba(255, 244, 232, 0.08), transparent 65%), rgba(40, 34, 32, 0.45);
  box-shadow: inset 0 1px 1px rgba(255, 245, 232, 0.22);
}
.ellik-drawer-card-idle:hover {
  background: linear-gradient(144deg, rgba(255, 244, 232, 0.14), transparent 65%), rgba(52, 44, 40, 0.56);
}
.ellik-drawer-squircle {
  border-radius: 9px !important;
}
.ellik-drawer-field {
  border-radius: 15px !important;
  border: 1px solid rgba(255, 240, 224, 0.16);
  background: linear-gradient(155deg, rgba(255, 245, 235, 0.06), transparent 60%), rgba(32, 27, 26, 0.48);
  box-shadow: inset 0 1px 1px rgba(255, 245, 232, 0.18), inset 0 -1px 1px rgba(0, 0, 0, 0.3);
  color-scheme: dark;
}
.ellik-drawer-field:focus {
  border-color: rgba(244, 241, 234, 0.58);
  background: linear-gradient(155deg, rgba(255, 245, 235, 0.1), transparent 60%), rgba(48, 41, 38, 0.62);
  box-shadow: inset 0 1px 1px rgba(255, 245, 232, 0.35), 0 0 0 3px rgba(244, 241, 234, 0.1);
}
.ellik-drawer-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 240, 224, 0.18) transparent;
}
`;

const RUBRO_OPTIONS: {
  value: BusinessCategory;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "Local Gastronómico", label: "Gastronomía", Icon: Utensils },
  { value: "Tienda de Ropa", label: "Indumentaria", Icon: ShoppingBag },
  { value: "Institución / Otro", label: "A medida", Icon: Building2 },
];

const DRAWER_EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.38,
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

    const lines = [
      `Hola ELLIK, te escribo desde la web para coordinar un diagnóstico.`,
      `• Rubro: ${rubro}`,
      selectedPlan ? `• Modalidad de interés: ${selectedPlan}` : null,
      name.trim() ? `• Nombre: ${name.trim()}` : null,
      businessAndCity.trim()
        ? `• Negocio y ciudad: ${businessAndCity.trim()}`
        : null,
      need.trim() ? `• Qué necesito resolver hoy: ${need.trim()}` : null,
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
            {/* Overlay translúcido para refractar estrellas y secciones detrás del cristal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-[6px]"
            />

            {/* Panel flotante de cristal espacial esmerilado y biselado */}
            <motion.aside
              data-lenis-prevent
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { x: 48, scale: 0.97, opacity: 0 }
              }
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { x: 48, scale: 0.97, opacity: 0 }
              }
              transition={{ duration: 0.42, ease: DRAWER_EASE }}
              style={{
                border: "1px solid rgba(255, 240, 224, 0.26)",
                background:
                  "linear-gradient(148deg, rgba(255, 241, 224, 0.14), transparent 22% 76%, rgba(255, 241, 224, 0.06)), rgba(24, 21, 20, 0.62)",
                boxShadow:
                  "inset 1px 1px 1px rgba(255, 245, 232, 0.45), inset -1px -1px 1px rgba(10, 6, 5, 0.42), inset 0 0 10px rgba(255, 241, 224, 0.08), 0 22px 72px rgba(0, 0, 0, 0.58)",
                backdropFilter: "blur(22px) saturate(1.35)",
                WebkitBackdropFilter: "blur(22px) saturate(1.35)",
              }}
              className="ellik-drawer-stage fixed inset-3 sm:inset-y-4 sm:right-4 sm:left-auto w-[calc(100%-24px)] sm:w-[min(510px,calc(100vw-32px))] z-10 rounded-[28px] sm:rounded-[34px] overflow-hidden flex flex-col"
            >
              <motion.div
                className="relative z-10 flex flex-1 min-h-0 flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Barra superior en píldora de vidrio */}
                <div className="shrink-0 px-4 pt-4 sm:px-7 sm:pt-6 pb-0">
                  <motion.div
                    variants={activeItemVariants}
                    data-drawer-topbar
                    className="ellik-drawer-pill rounded-full px-3.5 py-2 flex items-center justify-between border border-[rgba(255,240,224,0.22)] bg-[rgba(255,244,232,0.06)] shadow-[inset_1px_1px_1px_rgba(255,245,232,0.32),inset_-1px_-1px_1px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        aria-hidden="true"
                        className="ellik-drawer-pill w-5 h-5 shrink-0"
                        style={{
                          background:
                            "radial-gradient(ellipse at 32% 24%, #faf7fe 5%, #72ecf1 25%, transparent 58%), radial-gradient(ellipse at 67% 54%, #e1b7f9, #815add 55%, #353467 79%)",
                          boxShadow:
                            "inset 0 0 0 0.75px rgba(246, 245, 255, 0.75), inset 0 -2px 4px #604db4, 0 2px 8px rgba(71, 46, 113, 0.35)",
                        }}
                      />
                      <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#FFF6E9]/90 truncate">
                        Contacto directo
                      </span>
                    </div>

                    <button
                      type="button"
                      data-drawer-close
                      data-cursor="action"
                      aria-label="Cerrar panel de contacto"
                      onClick={onClose}
                      className="ellik-drawer-pill w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(255,240,224,0.2)] bg-[rgba(255,244,232,0.08)] hover:bg-[rgba(255,244,232,0.16)] text-[#FFF6E9] transition-all cursor-pointer shrink-0"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </motion.div>
                </div>

                {/* Cuerpo scrolleable con bandeja anidada de rubros y campos de cristal */}
                <div
                  data-lenis-prevent
                  className="ellik-drawer-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-7 py-5 flex flex-col justify-between gap-5"
                >
                  {/* Encabezado y chip opcional */}
                  <motion.div variants={activeItemVariants}>
                    <h2
                      id="contact-drawer-title"
                      className="font-display font-medium text-[28px] sm:text-[36px] leading-[1.04] tracking-[-0.02em] [word-spacing:0.05em]"
                    >
                      <span className="text-[#FFF8EE]">Contame sobre</span>{" "}
                      <span className="text-[#E5D5C7]/60">tu negocio.</span>
                    </h2>

                    <p className="font-sans text-[13px] text-[#E5D5C7]/75 mt-2 leading-relaxed">
                      Dejame estos datos y abrimos la charla directo en WhatsApp.
                    </p>

                    {selectedPlan && (
                      <div
                        data-drawer-plan-chip
                        className="ellik-drawer-pill bg-[#1e7461]/25 border border-[#75dac0]/35 text-[#b8f1dd] text-[11px] font-sans font-medium px-3 py-1 rounded-full inline-flex items-center gap-1.5 mt-3 max-w-full"
                      >
                        <span className="truncate">Modalidad: {selectedPlan}</span>
                        <button
                          type="button"
                          aria-label="Quitar modalidad"
                          onClick={() => setSelectedPlan("")}
                          className="shrink-0 text-[#b8f1dd]/75 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={12} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </motion.div>

                  <form
                    onSubmit={handleSendWhatsApp}
                    className="flex flex-col gap-5"
                  >
                    {/* Selector de rubro anidado en bandeja de cristal + tarjeta activa verde petróleo */}
                    <motion.div variants={activeItemVariants}>
                      <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.12em] text-[#E5D5C7]/65 mb-2 block">
                        Rubro de tu proyecto
                      </span>
                      <PresenceContext.Provider value={null}>
                        <LayoutGroup id="contact-rubro-selector">
                          <div
                            data-drawer-rubro-tray
                            className="ellik-drawer-tray grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-[20px] border border-[rgba(255,240,224,0.18)] bg-[rgba(255,242,228,0.05)] shadow-[inset_0_1px_1px_rgba(255,245,232,0.22),inset_0_-1px_1px_rgba(0,0,0,0.3)]"
                          >
                            {RUBRO_OPTIONS.map((option) => {
                              const active = rubro === option.value;
                              const Icon = option.Icon;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  data-drawer-rubro={option.value}
                                  aria-pressed={active}
                                  onClick={() => setRubro(option.value)}
                                  className={`ellik-drawer-card min-w-0 rounded-[14px] p-2.5 sm:p-3 flex flex-col items-start gap-2.5 text-left transition-all duration-200 relative overflow-hidden cursor-pointer ${
                                    active
                                      ? "border border-transparent text-white"
                                      : "ellik-drawer-card-idle text-[#E5D5C7]/80 hover:text-white"
                                  }`}
                                >
                                  {active && (
                                    <motion.div
                                      layoutId="activeGlassRubro"
                                      transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 32,
                                      }}
                                      style={{
                                        background:
                                          "radial-gradient(ellipse at 5% -20%, #3a9381, transparent 68%), linear-gradient(145deg, #1e7461, #08443a)",
                                        border:
                                          "1px solid rgba(196, 248, 231, 0.52)",
                                        boxShadow:
                                          "inset 0 1px 2px rgba(214, 252, 240, 0.48), 0 8px 18px rgba(8, 68, 58, 0.35)",
                                      }}
                                      className="ellik-drawer-card absolute inset-0 rounded-[14px]"
                                    />
                                  )}

                                  <span
                                    data-drawer-squircle
                                    className={`ellik-drawer-squircle relative z-10 w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 transition-colors ${
                                      active
                                        ? "bg-[rgba(235,255,247,0.18)] text-[#b8f1dd]"
                                        : "bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                                    }`}
                                  >
                                    <Icon
                                      size={14}
                                      strokeWidth={1.75}
                                      aria-hidden="true"
                                    />
                                  </span>

                                  <span
                                    data-rubro-label
                                    className={`relative z-10 font-sans text-[11px] sm:text-[12.5px] leading-tight whitespace-nowrap ${
                                      active
                                        ? "font-semibold text-white"
                                        : "font-medium"
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </LayoutGroup>
                      </PresenceContext.Provider>
                    </motion.div>

                    {/* Campos en paneles de cristal biselados */}
                    <motion.div
                      variants={activeItemVariants}
                      className="space-y-3.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="ellik-name"
                            className="font-sans font-semibold text-[11px] uppercase tracking-[0.12em] text-[#E5D5C7]/65 mb-2 block"
                          >
                            Tu nombre
                          </label>
                          <input
                            id="ellik-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Martín Gómez"
                            className="ellik-drawer-field w-full rounded-[15px] px-3.5 py-3 font-sans text-[13.5px] text-[#FFF8EE] placeholder:text-[#E5D5C7]/45 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ellik-business"
                            className="font-sans font-semibold text-[11px] uppercase tracking-[0.12em] text-[#E5D5C7]/65 mb-2 block"
                          >
                            Negocio y ciudad
                          </label>
                          <input
                            id="ellik-business"
                            type="text"
                            value={businessAndCity}
                            onChange={(e) => setBusinessAndCity(e.target.value)}
                            placeholder="Ej. Pizzería Sur — Río Tercero"
                            className="ellik-drawer-field w-full rounded-[15px] px-3.5 py-3 font-sans text-[13.5px] text-[#FFF8EE] placeholder:text-[#E5D5C7]/45 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="ellik-need"
                          className="font-sans font-semibold text-[11px] uppercase tracking-[0.12em] text-[#E5D5C7]/65 mb-2 block"
                        >
                          ¿Qué necesitás resolver hoy? (opcional)
                        </label>
                        <textarea
                          id="ellik-need"
                          rows={3}
                          value={need}
                          onChange={(e) => setNeed(e.target.value)}
                          placeholder="Ej. Recibir pedidos sin audios eternos los viernes a la noche..."
                          className="ellik-drawer-field w-full resize-none rounded-[15px] px-3.5 py-3 font-sans text-[13.5px] text-[#FFF8EE] placeholder:text-[#E5D5C7]/45 outline-none transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* CTA principal con brillo superior especular */}
                    <motion.div variants={activeItemVariants} className="pt-0.5">
                      <button
                        type="submit"
                        data-drawer-submit
                        data-cursor="action"
                        className="ellik-drawer-pill w-full rounded-full py-3.5 px-6 bg-[#F4F1EA] hover:brightness-105 text-[#181514] font-sans font-bold text-[13.5px] flex items-center justify-center gap-2 transition-all active:scale-[0.985] shadow-[inset_0_1px_1px_#FFFFFF,0_10px_28px_-8px_rgba(244,241,234,0.35)] cursor-pointer group"
                      >
                        <span>Continuar en WhatsApp</span>
                        <ArrowUpRight
                          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </button>
                      <p className="text-[11px] text-[#E5D5C7]/55 text-center mt-2.5 font-sans">
                        Se abre WhatsApp con tu consulta ya redactada · Respuesta
                        directa.
                      </p>
                    </motion.div>
                  </form>
                </div>

                {/* Pie con píldoras de cristal */}
                <motion.div
                  variants={activeItemVariants}
                  className="shrink-0 px-4 sm:px-7 py-4 border-t border-[rgba(255,240,224,0.12)] bg-[rgba(255,244,232,0.03)] flex items-center justify-between gap-3"
                >
                  <a
                    href={`mailto:${ELLIK_CONFIG.email}`}
                    data-drawer-email-pill
                    className="ellik-drawer-pill rounded-full px-3 py-1.5 bg-[rgba(255,244,232,0.07)] border border-[rgba(255,240,224,0.15)] text-[11.5px] font-sans text-[#FFF6E9]/80 hover:text-white transition-colors truncate min-w-0"
                  >
                    {ELLIK_CONFIG.email}
                  </a>

                  <button
                    type="button"
                    data-drawer-copy-email
                    onClick={handleCopyEmail}
                    className={`ellik-drawer-pill rounded-full px-3.5 py-1.5 border shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] text-[11.5px] font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      emailCopied
                        ? "border-[#75dac0]/45 bg-[#1e7461]/30 text-[#75dac0]"
                        : "bg-[rgba(255,244,232,0.12)] hover:bg-[rgba(255,244,232,0.2)] border-[rgba(255,240,224,0.24)] text-[#FFF6E9]"
                    }`}
                  >
                    {emailCopied ? (
                      <>
                        <Check size={12} aria-hidden="true" />
                        <span>Copiado ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} aria-hidden="true" />
                        <span>Copiar mail</span>
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
