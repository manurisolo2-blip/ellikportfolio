"use client";

import React, { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { OrbitalBackground } from "@/components/OrbitalBackground";
import { FixedFrameNav } from "@/components/FixedFrameNav";
import { AstronautScrollTracker } from "@/components/AstronautScrollTracker";
import { HeroSection } from "@/components/HeroSection";
import { MissionsSection } from "@/components/MissionsSection";
import { VelocityMarquee } from "@/components/VelocityMarquee";
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
      <AstronautScrollTracker />

      <main className="relative overflow-x-clip">
        <div className="relative z-10 pl-6 lg:pl-36 pr-6 lg:pr-28">
          <HeroSection onOpenDrawer={handleOpenDrawer} />
        </div>

        <MissionsSection />

        <div className="relative z-10">
          <VelocityMarquee />
          <InvestmentSection onOpenDrawer={handleOpenDrawer} />
        </div>

        <div className="relative z-10 pl-6 lg:pl-36 pr-6 lg:pr-28">
          <FinalCtaSection onOpenDrawer={handleOpenDrawer} />
        </div>
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
