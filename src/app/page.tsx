"use client";

import React, { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { OrbitalBackground } from "@/components/OrbitalBackground";
import { FixedFrameNav } from "@/components/FixedFrameNav";
import { HeroSection } from "@/components/HeroSection";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { MissionsSection } from "@/components/MissionsSection";
import { InvestmentSection } from "@/components/InvestmentSection";
import {
  EllikFooter,
  FinalCtaSection,
} from "@/components/FinalCtaSection";
import { ContactDrawer } from "@/components/ContactDrawer";
import type { BusinessCategory } from "@/data/ellikData";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedRubro, setSelectedRubro] =
    useState<BusinessCategory>("Local Gastronómico");
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const handleOpenDrawer = (preset?: {
    rubro?: BusinessCategory;
    plan?: string;
  }) => {
    setSelectedRubro(preset?.rubro ?? "Local Gastronómico");
    setSelectedPlan(preset?.plan ?? "");
    setDrawerOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)]">
      <LoadingScreen />

      <OrbitalBackground />

      <FixedFrameNav onOpenDrawer={handleOpenDrawer} />

      <main className="relative z-10 pl-6 lg:pl-48 pr-6 lg:pr-16">
        <HeroSection onOpenDrawer={handleOpenDrawer} />
        <ProblemSection />
        <SolutionSection />
        <MissionsSection />
        <InvestmentSection onOpenDrawer={handleOpenDrawer} />
        <FinalCtaSection onOpenDrawer={handleOpenDrawer} />
      </main>

      <EllikFooter />

      <ContactDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialRubro={selectedRubro}
        initialPlan={selectedPlan}
      />
    </div>
  );
}
