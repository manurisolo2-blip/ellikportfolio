"use client";

import React, { useEffect, useState } from "react";
import type { Mission } from "@/data/ellikData";

interface MissionVisualSurfaceProps {
  mission: Mission;
  className?: string;
}

function ArchitecturalFallback({
  variant,
}: {
  variant: Mission["fallbackVariant"];
}) {
  if (variant === "gastro-1") {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #101013 0%, #070709 55%, #0D0C0B 100%)",
        }}
      >
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="260"
            cy="125"
            r="96"
            fill="none"
            stroke="rgba(244,241,234,0.16)"
            strokeWidth="1"
          />
          <circle
            cx="260"
            cy="125"
            r="58"
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="175"
            x2="400"
            y2="90"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <rect
            x="44"
            y="64"
            width="112"
            height="122"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <rect x="258" y="123" width="4" height="4" fill="#F4F1EA" />
        </svg>
      </div>
    );
  }

  if (variant === "gastro-2") {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #0D0E10 0%, #060608 60%, #11100E 100%)",
        }}
      >
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
        >
          <ellipse
            cx="200"
            cy="125"
            rx="150"
            ry="64"
            transform="rotate(-14 200 125)"
            fill="none"
            stroke="rgba(255,255,255,0.13)"
            strokeWidth="1"
          />
          <line
            x1="72"
            y1="30"
            x2="72"
            y2="220"
            stroke="rgba(244,241,234,0.14)"
            strokeWidth="1"
          />
          <line
            x1="328"
            y1="30"
            x2="328"
            y2="220"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <rect
            x="164"
            y="89"
            width="72"
            height="72"
            fill="rgba(255,255,255,0.025)"
            stroke="rgba(244,241,234,0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  if (variant === "ropa") {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0E0E11 0%, #050507 62%, #0F0F12 100%)",
        }}
      >
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
        >
          <rect
            x="56"
            y="36"
            width="88"
            height="178"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
          <rect
            x="156"
            y="36"
            width="88"
            height="178"
            fill="rgba(244,241,234,0.03)"
            stroke="rgba(244,241,234,0.22)"
            strokeWidth="1"
          />
          <rect
            x="256"
            y="36"
            width="88"
            height="178"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
          <line
            x1="28"
            y1="125"
            x2="372"
            y2="125"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #0B0C0F 0%, #050506 58%, #0E1014 100%)",
      }}
    >
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <line
          x1="200"
          y1="0"
          x2="200"
          y2="250"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="125"
          x2="400"
          y2="125"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="125"
          r="82"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
        />
        <rect
          x="130"
          y="75"
          width="140"
          height="100"
          fill="none"
          stroke="rgba(244,241,234,0.18)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export function MissionVisualSurface({
  mission,
  className = "",
}: MissionVisualSurfaceProps) {
  const [imageReady, setImageReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setImageReady(false);

    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled && probe.naturalWidth > 0) {
        setImageReady(true);
      }
    };
    probe.onerror = () => {
      if (!cancelled) {
        setImageReady(false);
      }
    };
    probe.src = mission.previewImage;

    return () => {
      cancelled = true;
    };
  }, [mission.previewImage]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#08080A] ${className}`}
    >
      {imageReady ? (
        <img
          src={mission.previewImage}
          alt={mission.title}
          draggable={false}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <ArchitecturalFallback variant={mission.fallbackVariant} />
      )}
    </div>
  );
}
