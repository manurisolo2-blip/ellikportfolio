"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const MANIFESTO_STATEMENT =
  "La mayoría de los negocios pierde ventas en el teléfono. WhatsApp colapsado en hora pico, catálogos lentos y comisiones altas en apps de delivery.";

const MANIFESTO_WORDS = MANIFESTO_STATEMENT.split(/\s+/);

interface ManifestoWordProps {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

function ManifestoWord({
  word,
  index,
  total,
  scrollYProgress,
}: ManifestoWordProps) {
  const start = (index / Math.max(total, 1)) * 0.78;
  const end = Math.min(1, start + 0.22);
  const color = useTransform(scrollYProgress, [start, end], ["#27272A", "#FFFFFF"]);

  return (
    <motion.span style={{ color }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

export function ProblemSection() {
  const manifestoRef = useRef<HTMLHeadingElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: manifestoRef,
    offset: ["start 0.88", "end 0.52"],
  });

  return (
    <section id="problema" className="relative py-32 md:py-48">
      <div>
        <h2
          ref={manifestoRef}
          className="max-w-5xl font-display font-medium text-[clamp(2.4rem,5.5vw,5rem)] leading-[0.98] tracking-[-0.03em]"
        >
          {MANIFESTO_WORDS.map((word, index) => (
            <ManifestoWord
              key={`${index}-${word}`}
              word={word}
              index={index}
              total={MANIFESTO_WORDS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </h2>

        <div className="ml-auto max-w-md mt-14">
          <p className="font-sans text-lg text-[#A1A1AA] leading-relaxed">
            No necesitás otra plantilla linda que nadie entiende cómo usar.
            Necesitás que el cliente entre desde Instagram, elija en 30 segundos
            y te llegue el pedido ya armado.
          </p>
        </div>
      </div>
    </section>
  );
}
