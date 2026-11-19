"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface ProblemCardData {
  id: string;
  title: string;
  renderSketch: () => React.ReactNode;
}

const PROBLEM_CARDS: readonly ProblemCardData[] = [
  {
    id: "visitas-sin-pedidos",
    title: "MUCHAS VISITAS, POCOS PEDIDOS",
    renderSketch: () => (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="w-full h-auto max-h-[145px]"
      >
        {/* Ejes coordenados */}
        <path
          d="M 22 14 L 22 98 L 164 98"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 18 20 L 22 14 L 26 20 M 158 94 L 164 98 L 158 102"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ticks de escala */}
        <path
          d="M 19 42 L 22 42 M 19 68 L 22 68 M 64 98 L 64 101 M 108 98 L 108 101 M 150 98 L 150 101"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Curva ascendente punteada de visitas */}
        <path
          d="M 28 84 C 54 78, 76 54, 102 44 C 122 36, 138 24, 158 18"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeDasharray="3.5 3.5"
          strokeLinecap="round"
        />
        <circle
          cx="158"
          cy="18"
          r="2.5"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        {/* Línea plana de conversión abajo */}
        <path
          d="M 28 92 C 62 91.5, 110 92.5, 158 92"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle
          cx="158"
          cy="92"
          r="2.2"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    id: "whatsapp-colapsado",
    title: "WHATSAPP COLAPSADO EN HORA PICO",
    renderSketch: () => (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="w-full h-auto max-h-[145px]"
      >
        {/* Burbuja 1: audio largo sin leer */}
        <rect
          x="18"
          y="16"
          width="96"
          height="24"
          rx="2"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <path
          d="M 27 28 L 31 24 L 31 32 Z M 39 28 L 39 24 M 44 28 L 44 21 M 49 28 L 49 25 M 54 28 L 54 20 M 59 28 L 59 23 M 64 28 L 64 25 M 69 28 L 69 22 M 74 28 L 74 26"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Burbuja 2: mensaje apilado */}
        <rect
          x="32"
          y="48"
          width="102"
          height="22"
          rx="2"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <path
          d="M 42 56 L 96 56 M 42 62 L 78 62"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Burbuja 3: inferior */}
        <rect
          x="20"
          y="78"
          width="88"
          height="22"
          rx="2"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <path
          d="M 30 89 L 84 89"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        {/* Triángulos de alerta cruzados */}
        <path
          d="M 134 24 L 152 54 L 116 54 Z"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M 134 36 L 134 44 M 134 48 L 134 49.5"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 146 62 L 164 92 L 128 92 Z"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M 146 74 L 146 82 M 146 86 L 146 87.5"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "paginas-sin-confianza",
    title: "PÁGINAS QUE NO GENERAN CONFIANZA",
    renderSketch: () => (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="w-full h-auto max-h-[145px]"
      >
        {/* Ventana web */}
        <rect
          x="20"
          y="14"
          width="140"
          height="92"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <path
          d="M 20 30 L 160 30"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <circle
          cx="29"
          cy="22"
          r="1.8"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <circle
          cx="37"
          cy="22"
          r="1.8"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <circle
          cx="45"
          cy="22"
          r="1.8"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        {/* Bloque central marcado con ? */}
        <rect
          x="52"
          y="39"
          width="76"
          height="32"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <path
          d="M 86 50 C 86 46.5, 94 46.5, 94 50.5 C 94 53.5, 90 54, 90 57.5 M 90 61.5 L 90 63"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Grilla inferior incompleta */}
        <rect
          x="32"
          y="79"
          width="32"
          height="18"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <rect
          x="74"
          y="79"
          width="32"
          height="18"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
        />
        <path
          d="M 116 79 L 148 79 M 116 79 L 116 97"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "celular-pierde-ventas",
    title: "EL CELULAR TE HACE PERDER VENTAS",
    renderSketch: () => (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="w-full h-auto max-h-[145px]"
      >
        {/* Silueta de teléfono vertical */}
        <rect
          x="64"
          y="10"
          width="52"
          height="84"
          rx="4"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <path
          d="M 82 17 L 98 17"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Pantalla con X central */}
        <rect
          x="70"
          y="24"
          width="40"
          height="54"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
        />
        <path
          d="M 79 40 L 101 62 M 101 40 L 79 62"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Grietas y píxeles cayendo por abajo */}
        <path
          d="M 76 94 L 73 101 L 76 105 M 90 94 L 92 100 L 89 107 M 104 94 L 106 102"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="69"
          y="108"
          width="4"
          height="4"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <rect
          x="85"
          y="111"
          width="3.5"
          height="3.5"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <rect
          x="101"
          y="107"
          width="4.5"
          height="4.5"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
] as const;

const ACT1_WORDS = [
  { text: "TIENE", threshold: 0.05, row: 0 },
  { text: "UN", threshold: 0.11, row: 0 },
  { text: "PROBLEMA", threshold: 0.17, row: 0 },
  { text: "DE", threshold: 0.23, row: 1 },
  { text: "CONVERSIÓN.", threshold: 0.29, row: 1 },
] as const;

const ACT3_WORDS = [
  { text: "¿TE", threshold: 0.81, row: 0 },
  { text: "ESTÁ", threshold: 0.84, row: 0 },
  { text: "PASANDO", threshold: 0.87, row: 0 },
  { text: "ESTO", threshold: 0.9, row: 1 },
  { text: "HOY?", threshold: 0.93, row: 1 },
] as const;

function countActiveWords(
  words: readonly { threshold: number }[],
  progress: number
): number {
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    if (progress >= words[i].threshold) count = i + 1;
  }
  return count;
}

interface TiltedProblemCardProps {
  card: ProblemCardData;
  index: number;
  progress: MotionValue<number>;
}

function TiltedProblemCard({
  card,
  index,
  progress,
}: TiltedProblemCardProps) {
  const centerP = 0.44 + index * 0.09;
  const rotate = useTransform(
    progress,
    [centerP - 0.11, centerP, centerP + 0.11],
    [6, 0, -5]
  );
  const y = useTransform(
    progress,
    [centerP - 0.11, centerP, centerP + 0.11],
    [34, 0, 20]
  );

  return (
    <motion.article
      data-problem-card={card.id}
      style={{ rotate, y }}
      className="w-[270px] h-[270px] sm:w-[310px] sm:h-[310px] md:w-[340px] md:h-[340px] shrink-0 bg-[#0B0B0D] border border-white/[0.08] p-6 md:p-7 flex flex-col justify-between will-change-transform"
    >
      <h3 className="font-sans font-medium uppercase text-sm md:text-[15px] tracking-[0.02em] leading-snug text-white/90">
        {card.title}
      </h3>

      <div className="flex items-center justify-center pt-4">
        {card.renderSketch()}
      </div>
    </motion.article>
  );
}

export function ProblemSequenceSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = Boolean(useReducedMotion());

  const [act1Count, setAct1Count] = useState<number>(0);
  const [act3Count, setAct3Count] = useState<number>(0);
  const [act3Visible, setAct3Visible] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 34,
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const nextAct1 = countActiveWords(ACT1_WORDS, p);
    const nextAct3 = countActiveWords(ACT3_WORDS, p);
    const nextAct3Vis = p >= 0.8;

    setAct1Count((prev) => (prev === nextAct1 ? prev : nextAct1));
    setAct3Count((prev) => (prev === nextAct3 ? prev : nextAct3));
    setAct3Visible((prev) => (prev === nextAct3Vis ? prev : nextAct3Vis));
  });

  // Acto 2: el titular de Acto 1 sube y hace escala suave, luego se apaga en 0.74 -> 0.80
  const headlineY = useTransform(smoothProgress, [0.37, 0.48], ["0svh", "-22svh"]);
  const headlineScale = useTransform(smoothProgress, [0.37, 0.48], [1, 0.78]);
  const act1And2Opacity = useTransform(
    smoothProgress,
    [0, 0.74, 0.8],
    [1, 1, 0]
  );

  // Riel horizontal de 4 tarjetas inclinadas (0.38 -> 0.78)
  const railX = useTransform(smoothProgress, [0.38, 0.78], ["65vw", "-125%"]);
  const railOpacity = useTransform(
    smoothProgress,
    [0.36, 0.39, 0.74, 0.8],
    [0, 1, 1, 0]
  );

  if (reducedMotion) {
    return (
      <section
        id="problema"
        className="relative z-10 w-full bg-[#050505]/90 py-24 px-6 sm:px-10 lg:px-28"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-sans font-normal uppercase tracking-[-0.02em] leading-[1.04] text-[clamp(1.7rem,4.2vw,3.6rem)] text-white/95">
            LA MAYORÍA DE LOS NEGOCIOS
            <br />
            NO TIENE UN PROBLEMA
            <br />
            DE CLIENTES.
          </p>
          <p className="mt-8 md:mt-10 font-display font-semibold uppercase tracking-[0.04em] leading-[1.08] text-[clamp(1.85rem,4.5vw,3.85rem)] text-[#F4F1EA]">
            TIENE UN PROBLEMA DE CONVERSIÓN.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {PROBLEM_CARDS.map((card) => (
              <article
                key={card.id}
                data-problem-card={card.id}
                className="w-full max-w-[300px] aspect-square bg-[#0B0B0D] border border-white/[0.08] p-6 flex flex-col justify-between text-left"
              >
                <h3 className="font-sans font-medium uppercase text-sm tracking-[0.02em] text-white/90">
                  {card.title}
                </h3>
                <div className="flex items-center justify-center pt-4">
                  {card.renderSketch()}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-16 font-sans font-normal uppercase tracking-[-0.02em] leading-[1.06] text-[clamp(2rem,5vw,4.2rem)] text-white">
            ¿TE ESTÁ PASANDO{" "}
            <span className="font-display font-semibold text-[#F4F1EA]">
              ESTO HOY?
            </span>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="problema"
      className="relative z-10 w-full h-[460svh] bg-[#050505]/90"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col items-center justify-center px-6 sm:px-10 lg:px-28">
        {/* ACTO 1 & ACTO 2: Titular secuencial + subida suave */}
        <motion.div
          style={{
            y: headlineY,
            scale: headlineScale,
            opacity: act1And2Opacity,
          }}
          className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center will-change-transform"
        >
          <p className="font-sans font-normal uppercase tracking-[-0.02em] leading-[1.04] text-[clamp(1.7rem,4.2vw,3.6rem)] text-white/95">
            LA MAYORÍA DE LOS NEGOCIOS
            <br />
            NO TIENE UN PROBLEMA
            <br />
            DE CLIENTES.
          </p>

          <p
            aria-label="Tiene un problema de conversión."
            className="mt-8 md:mt-10 font-display font-semibold uppercase tracking-[0.04em] leading-[1.08] text-[clamp(1.85rem,4.5vw,3.85rem)] text-[#F4F1EA]"
          >
            {[0, 1].map((rowIdx) => (
              <span
                key={rowIdx}
                className="flex flex-wrap items-baseline justify-center gap-x-[0.3em]"
              >
                {ACT1_WORDS.map((word, idx) =>
                  word.row !== rowIdx ? null : (
                    <span
                      key={word.text}
                      className={`inline-block transition-none ${
                        idx < act1Count ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {word.text}
                    </span>
                  )
                )}
              </span>
            ))}
          </p>
        </motion.div>

        {/* ACTO 2: Riel horizontal de 4 tarjetas inclinadas en el tercio inferior */}
        <motion.div
          style={{ opacity: railOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[13svh] sm:bottom-[14svh] md:bottom-[10svh] z-20 flex items-center"
        >
          <motion.div
            style={{ x: railX }}
            className="flex items-center gap-6 md:gap-8 w-max will-change-transform"
          >
            {PROBLEM_CARDS.map((card, idx) => (
              <TiltedProblemCard
                key={card.id}
                card={card}
                index={idx}
                progress={smoothProgress}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* ACTO 3: Pregunta final palabra por palabra de golpe en el vacío (0.80 -> 1.00) */}
        <div
          aria-hidden={!act3Visible}
          className={`pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-28 text-center transition-none ${
            act3Visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="font-sans font-normal uppercase tracking-[-0.02em] leading-[1.06] text-[clamp(2rem,5vw,4.2rem)] text-white">
            <span className="flex flex-wrap items-baseline justify-center gap-x-[0.28em]">
              {ACT3_WORDS.map((word, idx) =>
                word.row !== 0 ? null : (
                  <span
                    key={word.text}
                    className={`inline-block transition-none ${
                      act3Visible && idx < act3Count
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    {word.text}
                  </span>
                )
              )}
            </span>
          </p>

          <p className="mt-2 md:mt-3 font-display font-semibold uppercase tracking-[0.03em] leading-[1.04] text-[clamp(2.1rem,5.2vw,4.4rem)] text-[#F4F1EA]">
            <span className="flex flex-wrap items-baseline justify-center gap-x-[0.28em]">
              {ACT3_WORDS.map((word, idx) =>
                word.row !== 1 ? null : (
                  <span
                    key={word.text}
                    className={`inline-block transition-none ${
                      act3Visible && idx < act3Count
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    {word.text}
                  </span>
                )
              )}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProblemSequenceSection;
