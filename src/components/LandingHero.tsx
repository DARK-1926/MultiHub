import React from "react";
import { ArrowDown } from "lucide-react";
import { RotatingIndicator } from "./RotatingIndicator";

export interface LandingHeroProps {
  className?: string;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ className = "" }) => {
  return (
    <section
      aria-label="Hero Section"
      className={`min-h-screen w-full flex flex-col justify-between bg-paper pt-24 md:pt-28 pb-8 px-4 md:px-12 border-b-2 border-borderline ${className}`}
    >
      {/* Top spacing / subtitle tag */}
      <div className="w-full flex items-center justify-between font-space text-[12px] uppercase tracking-wider text-ink/70">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-brand-orange shadow-[0_0_8px_#FF4D00] animate-pulse" />
          <span>SYS.VER 3.0 // BLACK THEME CP TRACKER</span>
        </div>
        <div className="hidden sm:block text-brand-orange font-bold">MULTI-PLATFORM STREAK MATRIX</div>
      </div>

      {/* Main Massive Typographic Headline */}
      <div className="my-auto py-8 md:py-16 text-center w-full overflow-hidden flex flex-col items-center justify-center">
        <h1
          className="font-archivo uppercase text-ink tracking-tight select-none"
          style={{
            fontSize: "clamp(2.5rem, 16vw, 9rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.04em",
          }}
        >
          RANKSTACK
        </h1>
        <p className="mt-4 font-space text-xs md:text-sm uppercase tracking-widest text-brand-orange font-bold">
          High-Velocity Competitive Programming Dashboard
        </p>
      </div>

      {/* 2px Horizontal Rule and Metadata Row */}
      <div className="w-full">
        <div className="w-full h-0 border-b-2 border-borderline mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-items-center md:justify-items-stretch gap-6 font-space text-xs md:text-sm text-ink">
          {/* Left Metadata */}
          <div className="text-center md:text-left flex flex-col justify-center">
            <span className="font-bold uppercase tracking-tight text-ink">
              Track every platform.
            </span>
            <span className="text-brand-orange uppercase font-bold tracking-tight">
              One streak to rule them.
            </span>
          </div>

          {/* Center Rotating Scroll Indicator */}
          <div className="flex justify-center">
            <a href="#marquee-section" aria-label="Scroll down to details">
              <RotatingIndicator
                text="ENTER DASHBOARD • ENTER DASHBOARD • "
                icon={<ArrowDown className="w-5 h-5 text-ink" />}
                idSuffix="landing"
              />
            </a>
          </div>

          {/* Right Metadata */}
          <div className="text-center md:text-right flex flex-col justify-center">
            <span className="font-bold uppercase tracking-tight">
              LeetCode · CodeChef · GitHub
            </span>
            <span className="text-ink/70 uppercase tracking-tight">
              GeeksforGeeks · Codeforces
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
