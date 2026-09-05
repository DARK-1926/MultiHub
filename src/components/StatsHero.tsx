"use client";

import React, { useState, useRef } from "react";
import { RotateCw, ShieldCheck, Activity, Cpu } from "lucide-react";
import { RotatingIndicator } from "./RotatingIndicator";

export interface StatsHeroProps {
  currentStreak: number;
  lastSyncedText: string;
  totalProblemsSolved: number;
  userName?: string;
  className?: string;
}

export const StatsHero: React.FC<StatsHeroProps> = ({
  currentStreak,
  lastSyncedText,
  totalProblemsSolved,
  userName = "LIVE",
  className = "",
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Subtle 3D tilt (max 4.5 degrees)
    const tiltX = ((mouseY - centerY) / centerY) * -4.5;
    const tiltY = ((mouseX - centerX) / centerX) * 4.5;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      aria-label="Streak Overview"
      className={`relative w-full bg-paper pt-24 md:pt-28 pb-8 px-4 md:px-12 border-b-2 border-borderline overflow-hidden select-none transition-colors ${className}`}
      style={{
        perspective: "1200px",
      }}
    >
      {/* 1. 3D Volumetric Energy Glow Background */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255, 77, 0, 0.16) 0%, rgba(255, 77, 0, 0.04) 48%, transparent 75%)",
          opacity: isHovered ? 1 : 0.85,
        }}
      />

      {/* 2. Cybernetic Perspective Grid Floor */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-25 overflow-hidden"
        style={{
          perspective: "600px",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: "rotateX(72deg) translateY(-20px)",
            transformOrigin: "bottom center",
            backgroundImage: `
              linear-gradient(to right, rgba(255, 77, 0, 0.35) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 77, 0, 0.35) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "linear-gradient(to top, black 25%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to top, black 25%, transparent 90%)",
          }}
        />
      </div>

      {/* 3. Subtle Holographic Concentric Reticles */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] md:w-[600px] md:h-[600px] rounded-full border border-brand-orange/15 opacity-40 animate-[spin_60s_linear_infinite]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[440px] md:h-[440px] rounded-full border border-dashed border-brand-orange/20 opacity-30 animate-[spin_40s_linear_infinite_reverse]" />

      {/* 4. Tactical Cybernetic Corner Crosshairs */}
      <div className="pointer-events-none absolute top-4 left-4 md:left-12 font-space text-[10px] text-ink/30 font-bold uppercase tracking-widest flex items-center gap-1">
        <span className="text-brand-orange">+</span> [ SEC // 01 ]
      </div>
      <div className="pointer-events-none absolute top-4 right-4 md:right-12 font-space text-[10px] text-ink/30 font-bold uppercase tracking-widest flex items-center gap-1">
        <span className="text-brand-orange">+</span> [ MATRIX // v2.4 ]
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 md:left-12 font-space text-[10px] text-ink/30 font-bold uppercase tracking-widest hidden md:flex items-center gap-1">
        <span className="text-brand-orange">+</span> [ LAT: 15.4298° N ]
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 md:right-12 font-space text-[10px] text-ink/30 font-bold uppercase tracking-widest hidden md:flex items-center gap-1">
        <span className="text-brand-orange">+</span> [ LON: 75.0065° E ]
      </div>

      {/* 5. Main 3D Parallax Tilt Layer */}
      <div
        className="relative z-10 w-full transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top Status Badge */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-space text-[11px] md:text-[12px] uppercase tracking-wider text-ink/70 mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-orange shadow-[0_0_12px_#FF4D00] animate-pulse" />
            <span className="font-bold text-ink truncate">{userName.toUpperCase()} // UNIFIED CP & GIT MATRIX</span>
          </div>
          <div className="self-start sm:self-auto font-bold text-brand-orange flex items-center gap-1.5 bg-brand-orange/10 px-2 py-0.5 sm:px-2.5 sm:py-1 border border-brand-orange/30 rounded">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] sm:text-[11px]">STATUS: REAL-TIME MONITORED</span>
          </div>
        </div>

        {/* Central 3D Streak Arena */}
        <div className="relative py-4 sm:py-8 md:py-14 text-center w-full flex items-center justify-center">
          {/* Left 3D Isometric Telemetry Plate */}
          <div
            className="hidden xl:flex absolute left-4 2xl:left-12 flex-col gap-1.5 text-left font-space text-[11px] bg-surface/85 backdrop-blur-md border-2 border-borderline p-4 rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)] transform -rotate-1 hover:rotate-0 transition-all duration-300"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="flex items-center justify-between gap-6 text-brand-orange font-bold text-[10px] pb-1.5 border-b border-borderline">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                TELEMETRY MESH
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_6px_#FF4D00] animate-ping" />
            </div>
            <div className="text-ink/60 flex justify-between gap-4">
              <span>PING LATENCY:</span>
              <span className="text-ink font-bold">12ms (FAST)</span>
            </div>
            <div className="text-ink/60 flex justify-between gap-4">
              <span>IIIT-DWD NODE:</span>
              <span className="text-ink font-bold">ONLINE</span>
            </div>
            <div className="text-ink/60 flex justify-between gap-4">
              <span>SYNC CYCLE:</span>
              <span className="text-brand-orange font-bold">CONTINUOUS</span>
            </div>
          </div>

          {/* Central Dimensional Number & Label */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ transform: "translateZ(50px)" }}
          >
            <div
              className="font-archivo text-ink tracking-tight select-none transition-transform duration-200"
              style={{
                fontSize: "clamp(3.75rem, 16vw, 13.5rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.05em",
                textShadow: `
                  0 1px 0 rgba(255, 255, 255, 0.9),
                  0 2px 0 rgba(200, 200, 200, 0.7),
                  0 3px 0 rgba(120, 120, 120, 0.6),
                  0 4px 0 rgba(80, 80, 80, 0.5),
                  0 8px 25px rgba(255, 77, 0, 0.45),
                  0 16px 45px rgba(255, 77, 0, 0.25)
                `,
              }}
            >
              {currentStreak}
            </div>

            <div
              className="font-archivo uppercase text-brand-orange tracking-tighter mt-1 sm:mt-3 relative"
              style={{
                fontSize: "clamp(1.15rem, 4vw, 3.25rem)",
                lineHeight: 0.9,
                textShadow: "0 0 20px rgba(255, 77, 0, 0.6), 0 0 40px rgba(255, 77, 0, 0.3)",
              }}
            >
              DAY STREAK
            </div>
          </div>

          {/* Right 3D Isometric Protocol Plate */}
          <div
            className="hidden xl:flex absolute right-4 2xl:right-12 flex-col gap-1.5 text-left font-space text-[11px] bg-surface/85 backdrop-blur-md border-2 border-borderline p-4 rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)] transform rotate-1 hover:rotate-0 transition-all duration-300"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="flex items-center justify-between gap-6 text-brand-orange font-bold text-[10px] pb-1.5 border-b border-borderline">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                STREAK INTEGRITY
              </span>
              <span className="text-green-400 font-mono text-[10px] font-bold">OPTIMAL</span>
            </div>
            <div className="text-ink/60 flex justify-between gap-4">
              <span>TARGET RATING:</span>
              <span className="text-ink font-bold">1600+ (3★ CC)</span>
            </div>
            <div className="text-ink/60 flex justify-between gap-4">
              <span>NEXT DRILL:</span>
              <span className="text-ink font-bold">STARTERS 255</span>
            </div>
            <div className="text-ink/60 flex justify-between gap-4">
              <span>ACCOUNTS LINKED:</span>
              <span className="text-brand-orange font-bold">6 ISOLATED</span>
            </div>
          </div>
        </div>

        {/* 2px Horizontal Rule and Metadata Row */}
        <div className="w-full" style={{ transform: "translateZ(20px)" }}>
          <div className="w-full h-0 border-b-2 border-borderline mb-4 sm:mb-6 relative">
            {/* Center orange laser spark on divider */}
            <span className="absolute left-1/2 -top-1 -translate-x-1/2 w-12 h-0.5 bg-brand-orange shadow-[0_0_10px_#FF4D00]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-items-center md:justify-items-stretch gap-3 sm:gap-6 font-space text-xs md:text-sm text-ink">
            {/* Left: Last Synced text */}
            <div className="text-center md:text-left flex flex-col justify-center">
              <span className="text-ink/60 uppercase text-[10px] sm:text-[11px] flex items-center gap-1.5 justify-center md:justify-start">
                <Cpu className="w-3 h-3 text-brand-orange" />
                Telemetry Status
              </span>
              <span className="font-bold uppercase tracking-tight text-ink mt-0.5 text-xs sm:text-sm">
                {lastSyncedText}
              </span>
            </div>

            {/* Center: Repurposed Rotating Indicator */}
            <div className="hidden sm:flex justify-center transform hover:scale-105 transition-transform">
              <RotatingIndicator
                text="LIVE • SYNCED • LIVE • SYNCED • "
                icon={<RotateCw className="w-5 h-5 text-ink" />}
                idSuffix="dashboard"
              />
            </div>

            {/* Right: Total Problems Solved */}
            <div className="text-center md:text-right flex flex-col justify-center">
              <span className="text-ink/60 uppercase text-[10px] sm:text-[11px]">Cumulative Solves & Commits</span>
              <span className="font-bold uppercase tracking-tight text-brand-orange mt-0.5 text-xs sm:text-sm">
                {totalProblemsSolved.toLocaleString()} Solves & Commits
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
