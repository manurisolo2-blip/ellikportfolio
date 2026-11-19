"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimate,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  INVESTMENT_PLANS,
  type BusinessCategory,
  type InvestmentPlan,
} from "@/data/ellikData";

interface InvestmentSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

interface ServiceRowProps {
  plan: InvestmentPlan;
  index: number;
  isInView: boolean;
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

function ServiceRow({
  plan,
  index,
  isInView,
  onOpenDrawer,
}: ServiceRowProps) {
  const [curtainScope, animateCurtain] = useAnimate<HTMLSpanElement>();
  const [isHovered, setIsHovered] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const finePointerRef = useRef(false);
  const btnX = useSpring(0, { stiffness: 240, damping: 18 });
  const btnY = useSpring(0, { stiffness: 240, damping: 18 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => {
      finePointerRef.current = mq.matches;
      if (!mq.matches) {
        btnX.set(0);
        btnY.set(0);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [btnX, btnY]);

  const handleRowEnter = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fromTop = e.clientY < rect.top + rect.height / 2;
    setIsHovered(true);
    if (curtainScope.current) {
      void animateCurtain(
        curtainScope.current,
        { y: fromTop ? "-101%" : "101%" },
        { duration: 0 }
      ).then(() => {
        if (curtainScope.current) {
          void animateCurtain(
            curtainScope.current,
            { y: "0%" },
            { duration: 0.36, ease: [0.16, 1, 0.3, 1] }
          );
        }
      });
    }
  };

  const handleRowLeave = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const toTop = e.clientY < rect.top + rect.height / 2;
    setIsHovered(false);
    btnX.set(0);
    btnY.set(0);
    if (curtainScope.current) {
      void animateCurtain(
        curtainScope.current,
        { y: toTop ? "-101%" : "101%" },
        { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
      );
    }
  };

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!finePointerRef.current || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    btnX.set(nx * 6);
    btnY.set(ny * 6);
  };

  const handleBtnMouseLeave = () => {
    btnX.set(0);
    btnY.set(0);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      data-cursor="action"
      onMouseEnter={handleRowEnter}
      onMouseLeave={handleRowLeave}
      onClick={() =>
        onOpenDrawer({
          rubro: plan.defaultRubro,
          plan: plan.title,
        })
      }
      className="relative overflow-hidden border-t-2 border-[#050505] py-10 px-4 -mx-4 md:px-6 md:-mx-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
    >
      {/* Cortina negra #050505 sensible a la dirección de entrada/salida */}
      <span
        ref={curtainScope}
        aria-hidden="true"
        style={{ transform: "translateY(-102%)" }}
        className="pointer-events-none absolute inset-0 z-0 bg-[#050505] will-change-transform"
      />

      <div className="relative z-10 max-w-2xl">
        <h3
          className={`font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] leading-[1.08] transition-colors duration-200 ${
            isHovered ? "text-[#F4F1EA]" : "text-[#050505]"
          }`}
        >
          {plan.title}
        </h3>

        <p
          className={`mt-3 font-sans text-base md:text-[17px] leading-relaxed transition-colors duration-200 ${
            isHovered ? "text-[#F4F1EA]/80" : "text-[#050505]/75"
          }`}
        >
          {plan.description}
        </p>
      </div>

      <motion.button
        ref={buttonRef}
        type="button"
        data-cursor="action"
        style={{ x: btnX, y: btnY }}
        onMouseMove={handleBtnMouseMove}
        onMouseLeave={handleBtnMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDrawer({
            rubro: plan.defaultRubro,
            plan: plan.title,
          });
        }}
        className={`relative z-10 shrink-0 inline-flex min-h-[44px] items-center gap-2 border-2 px-5 py-3 font-mono text-xs tracking-[0.12em] uppercase transition-colors duration-200 self-start md:self-center will-change-transform ${
          isHovered
            ? "border-[#F4F1EA] bg-transparent text-[#F4F1EA] hover:bg-[#F4F1EA] hover:text-[#050505]"
            : "border-[#050505] bg-transparent text-[#050505]"
        }`}
      >
        <span>Consultar</span>
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </motion.button>
    </motion.article>
  );
}

export function InvestmentSection({ onOpenDrawer }: InvestmentSectionProps) {
  const revealRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(contentRef, { once: true, margin: "-10%" });

  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "start 20%", "end 65%", "end start"],
  });

  const smoothReveal = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  const revealScale = useTransform(
    smoothReveal,
    [0, 0.33, 0.67, 1],
    [0.88, 1, 1, 0.94]
  );
  const revealOpacity = useTransform(
    smoothReveal,
    [0, 0.25, 0.82, 1],
    [0.55, 1, 1, 0.72]
  );

  return (
    <section
      ref={revealRef}
      id="servicios"
      className="relative w-full overflow-x-clip py-4"
    >
      <motion.div
        style={{
          scale: revealScale,
          opacity: revealOpacity,
        }}
        className="w-full bg-[#F4F1EA] text-[#050505] py-28 md:py-36 selection:bg-[#050505] selection:text-[#F4F1EA] will-change-[transform,opacity]"
      >
        <div ref={contentRef} className="pl-6 lg:pl-36 pr-6 lg:pr-28">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.96] tracking-[-0.03em] text-[#050505] max-w-4xl"
          >
            Tres formas de trabajar juntos.
          </motion.h2>

          <div className="mt-16 md:mt-20 border-b-2 border-[#050505]">
            {INVESTMENT_PLANS.map((plan, index) => (
              <ServiceRow
                key={plan.code}
                plan={plan}
                index={index}
                isInView={isInView}
                onOpenDrawer={onOpenDrawer}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
