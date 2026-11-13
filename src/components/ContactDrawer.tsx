"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import {
  BUSINESS_CATEGORIES,
  ELLIK_CONFIG,
  type BusinessCategory,
} from "@/data/ellikData";

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRubro?: BusinessCategory;
  initialPlan?: string;
}

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
      setTimeout(() => setEmailCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${ELLIK_CONFIG.email}`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-drawer-title"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Panel deslizable desde la derecha */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: "var(--bg-glass)",
              backdropFilter: "blur(16px)",
            }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col justify-between overflow-y-auto border-l border-[var(--border-hairline)] p-6 sm:p-10"
          >
            <div>
              {/* Cabecera del drawer */}
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-5">
                <span className="telemetry-label text-[11px] text-[var(--text-secondary)]">
                  TRANSMISIÓN DIRECTA // ELLIK
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="telemetry-label text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  [ ESC / CERRAR ]
                </button>
              </div>

              <h2
                id="contact-drawer-title"
                className="mt-8 font-display text-3xl sm:text-4xl font-bold uppercase tracking-[-0.03em] leading-[0.98] text-[var(--text-primary)]"
              >
                CONTAME SOBRE TU{" "}
                <span className="serif-accent">NEGOCIO</span>
              </h2>

              {selectedPlan && (
                <div className="mt-5 flex items-center justify-between border border-[var(--border-hairline)] bg-white/[0.03] px-3.5 py-2.5">
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--accent-starlight)]">
                    MODALIDAD: {selectedPlan}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("")}
                    className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    QUITAR ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSendWhatsApp} className="mt-8 space-y-7">
                {/* Selectores rápidos de rubro */}
                <div>
                  <span className="telemetry-label block text-[11px] text-[var(--text-muted)] mb-3">
                    RUBRO DE TU PROYECTO
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {BUSINESS_CATEGORIES.map((category) => {
                      const active = rubro === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setRubro(category)}
                          className={`border px-3 py-3 text-left font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
                            active
                              ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[#050505] font-medium"
                              : "border-[var(--border-hairline)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inputs minimalistas con borde inferior */}
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="ellik-name"
                      className="telemetry-label block text-[10px] text-[var(--text-muted)]"
                    >
                      TU NOMBRE
                    </label>
                    <input
                      id="ellik-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Martín Gómez"
                      className="w-full border-b border-white/20 focus:border-white bg-transparent py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ellik-business"
                      className="telemetry-label block text-[10px] text-[var(--text-muted)]"
                    >
                      NOMBRE DE TU NEGOCIO Y CIUDAD
                    </label>
                    <input
                      id="ellik-business"
                      type="text"
                      value={businessAndCity}
                      onChange={(e) => setBusinessAndCity(e.target.value)}
                      placeholder="Ej. Pizzería Sur — Río Tercero"
                      className="w-full border-b border-white/20 focus:border-white bg-transparent py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ellik-need"
                      className="telemetry-label block text-[10px] text-[var(--text-muted)]"
                    >
                      ¿QUÉ NECESITÁS RESOLVER HOY? (OPCIONAL)
                    </label>
                    <textarea
                      id="ellik-need"
                      rows={3}
                      value={need}
                      onChange={(e) => setNeed(e.target.value)}
                      placeholder="Ej. Recibir pedidos sin audios eternos los viernes a la noche..."
                      className="w-full resize-none border-b border-white/20 focus:border-white bg-transparent py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full border border-[var(--text-primary)] bg-[var(--text-primary)] px-6 py-4 font-mono text-xs tracking-[0.16em] uppercase font-medium text-[#050505] transition-colors hover:bg-transparent hover:text-[var(--text-primary)]"
                >
                  ENVIAR POR WHATSAPP ↗
                </button>
              </form>
            </div>

            {/* Pie del drawer: copiar email */}
            <div className="mt-10 pt-5 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-mono text-[11px] tracking-[0.12em] text-[var(--text-muted)]">
                {ELLIK_CONFIG.email}
              </span>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {emailCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--accent-starlight)]" />
                    <span className="text-[var(--accent-starlight)]">
                      EMAIL COPIADO ✓
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>COPIAR EMAIL</span>
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
