"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  PresenceContext,
  motion,
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
.ellik-drawer-pill {
  border-radius: 9999px !important;
}
.ellik-drawer-field {
  border-radius: 12px !important;
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
      staggerChildren: 0.04,
      delayChildren: 0.06,
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
            className="fixed inset-0 z-[60] flex justify-end"
          >
            {/* Overlay con desenfoque sutil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

          {/* Panel lateral de cristal oscuro elevado */}
          <motion.aside
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: DRAWER_EASE }}
            className="relative z-10 flex h-[100dvh] w-full max-w-[500px] flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-[#09090C]/95 backdrop-blur-2xl border-l border-white/[0.1] shadow-[-24px_0_80px_rgba(0,0,0,0.85)] p-5 sm:p-8"
          >
            {/* Resplandor radial ambiental muy sutil arriba a la derecha */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 100% 0%, rgba(244,241,234,0.07), transparent 55%)",
              }}
            />

            <motion.div
              className="relative z-10 flex flex-1 flex-col"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Barra superior: disponibilidad real + cierre táctil */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between pb-5 border-b border-white/[0.08]"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="ellik-drawer-pill w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                  />
                  <span className="font-sans font-medium text-[11px] uppercase tracking-[0.16em] text-white/60">
                    Contacto directo
                  </span>
                </div>

                <button
                  type="button"
                  data-drawer-close
                  data-cursor="action"
                  onClick={onClose}
                  className="ellik-drawer-pill rounded-full border border-white/15 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.08] px-3.5 py-1.5 min-h-[36px] flex items-center gap-1.5 text-[11px] font-sans font-medium text-white/75 hover:text-white transition-all cursor-pointer"
                >
                  <span>Cerrar</span>
                  <X size={13} aria-hidden="true" />
                </button>
              </motion.div>

              {/* Titular respirable + bajada + chip contextual opcional */}
              <motion.div variants={itemVariants} className="mt-6 sm:mt-7">
                <h2
                  id="contact-drawer-title"
                  className="font-display font-medium text-[32px] sm:text-[38px] leading-[1.06] tracking-[-0.015em] [word-spacing:0.05em]"
                >
                  <span className="text-white">Contame sobre</span>{" "}
                  <span className="text-[#F4F1EA]/55">tu negocio.</span>
                </h2>

                <p className="font-sans text-sm text-[#8A8A93] mt-2.5 leading-relaxed">
                  Dejame estos datos y abrimos la charla directo en WhatsApp.
                </p>

                {selectedPlan && (
                  <div
                    data-drawer-plan-chip
                    className="ellik-drawer-pill inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-[#F4F1EA]/10 border border-[#F4F1EA]/20 text-xs font-sans text-[#F4F1EA] max-w-full"
                  >
                    <span className="truncate">Modalidad: {selectedPlan}</span>
                    <button
                      type="button"
                      aria-label="Quitar modalidad"
                      onClick={() => setSelectedPlan("")}
                      className="shrink-0 text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors cursor-pointer"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </motion.div>

              <form onSubmit={handleSendWhatsApp} className="mt-6 space-y-5">
                {/* Selector táctil de rubro en 3 tarjetas compactas */}
                <motion.div variants={itemVariants}>
                  <span className="font-sans font-medium text-[11px] uppercase tracking-[0.14em] text-white/55 mb-2 block">
                    Rubro de tu proyecto
                  </span>
                  <PresenceContext.Provider value={null}>
                    <LayoutGroup id="contact-rubro-selector">
                      <div className="grid grid-cols-3 gap-2.5">
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
                              className={`ellik-drawer-field rounded-xl p-3 sm:p-3.5 flex flex-col items-start gap-2.5 text-left transition-all duration-200 cursor-pointer relative overflow-hidden border ${
                                active
                                  ? "border-[#F4F1EA] text-[#050505]"
                                  : "bg-white/[0.03] border-white/[0.1] text-white/65 hover:border-white/25 hover:text-white"
                              }`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="activeRubro"
                                  transition={{
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 32,
                                  }}
                                  className="ellik-drawer-field absolute inset-0 rounded-xl bg-[#F4F1EA]"
                                />
                              )}
                              <Icon
                                size={16}
                                strokeWidth={1.6}
                                className="relative z-10 shrink-0"
                              />
                              <span
                                data-rubro-label
                                className={`relative z-10 font-sans text-[12px] sm:text-[13px] leading-tight whitespace-nowrap ${
                                  active ? "font-medium" : "font-normal"
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

                {/* Campos elevados y legibles */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="ellik-name"
                        className="font-sans font-medium text-[11px] uppercase tracking-[0.14em] text-white/55 mb-2 block"
                      >
                        Tu nombre
                      </label>
                      <input
                        id="ellik-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Martín Gómez"
                        className="ellik-drawer-field w-full rounded-xl bg-white/[0.035] border border-white/[0.1] px-4 py-3.5 font-sans text-base sm:text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:bg-white/[0.06] focus:border-[#F4F1EA]/60 focus:ring-2 focus:ring-[#F4F1EA]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="ellik-business"
                        className="font-sans font-medium text-[11px] uppercase tracking-[0.14em] text-white/55 mb-2 block"
                      >
                        Negocio y ciudad
                      </label>
                      <input
                        id="ellik-business"
                        type="text"
                        value={businessAndCity}
                        onChange={(e) => setBusinessAndCity(e.target.value)}
                        placeholder="Ej. Pizzería Sur — Río Tercero"
                        className="ellik-drawer-field w-full rounded-xl bg-white/[0.035] border border-white/[0.1] px-4 py-3.5 font-sans text-base sm:text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:bg-white/[0.06] focus:border-[#F4F1EA]/60 focus:ring-2 focus:ring-[#F4F1EA]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="ellik-need"
                      className="font-sans font-medium text-[11px] uppercase tracking-[0.14em] text-white/55 mb-2 block"
                    >
                      ¿Qué necesitás resolver hoy? (opcional)
                    </label>
                    <textarea
                      id="ellik-need"
                      rows={3}
                      value={need}
                      onChange={(e) => setNeed(e.target.value)}
                      placeholder="Ej. Recibir pedidos sin audios eternos los viernes a la noche..."
                      className="ellik-drawer-field w-full resize-none rounded-xl bg-white/[0.035] border border-white/[0.1] px-4 py-3.5 font-sans text-base sm:text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:bg-white/[0.06] focus:border-[#F4F1EA]/60 focus:ring-2 focus:ring-[#F4F1EA]/10"
                    />
                  </div>
                </motion.div>

                {/* CTA principal a WhatsApp */}
                <motion.div variants={itemVariants} className="pt-1">
                  <button
                    type="submit"
                    data-drawer-submit
                    data-cursor="action"
                    className="ellik-drawer-pill rounded-full w-full py-4 px-6 bg-[#F4F1EA] hover:bg-white text-[#050505] font-sans font-semibold text-sm tracking-[0.02em] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] group cursor-pointer shadow-[0_12px_30px_-10px_rgba(244,241,234,0.35)]"
                  >
                    <span>Continuar en WhatsApp</span>
                    <ArrowUpRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </button>
                  <p className="text-[11px] text-white/40 mt-3 text-center font-sans">
                    Se abre WhatsApp con tu consulta ya redactada · Respuesta directa.
                  </p>
                </motion.div>
              </form>

              {/* Pie anclado: email directo + pill de copiado */}
              <motion.div
                variants={itemVariants}
                className="mt-auto pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4"
              >
                <a
                  href={`mailto:${ELLIK_CONFIG.email}`}
                  className="text-xs font-sans text-white/60 hover:text-white transition-colors truncate"
                >
                  {ELLIK_CONFIG.email}
                </a>

                <button
                  type="button"
                  data-drawer-copy-email
                  onClick={handleCopyEmail}
                  className={`ellik-drawer-pill rounded-full border px-3 py-1.5 text-[11px] font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    emailCopied
                      ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
                      : "border-white/[0.12] bg-white/[0.03] hover:border-white/30 text-white/80 hover:text-white"
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
