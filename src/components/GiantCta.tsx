import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface GiantCtaProps {
  title?: string;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
}

export const GiantCta: React.FC<GiantCtaProps> = ({
  title = "START TRACKING",
  buttonText = "ENTER DASHBOARD",
  buttonHref = "/dashboard",
  className = "",
}) => {
  return (
    <section
      aria-label="Call to Action"
      className={`w-full py-20 md:py-32 px-6 md:px-12 flex flex-col items-center justify-center text-center bg-paper border-b-2 border-borderline ${className}`}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <span className="font-space text-xs md:text-sm uppercase tracking-widest text-brand-orange font-bold mb-4">
          // MULTI-ACCOUNT SYNC · ZERO CONFIG
        </span>

        <h2
          className="font-archivo uppercase text-ink tracking-tighter leading-none mb-8 md:mb-12"
          style={{ fontSize: "clamp(2rem, 14vw, 7rem)", lineHeight: 0.88 }}
        >
          {title}
        </h2>

        {/* Pill-shaped button */}
        <Link
          href={buttonHref}
          className="group inline-flex items-center gap-3 bg-brand-orange text-black hover:bg-white hover:text-black font-space text-sm md:text-base font-bold uppercase px-8 md:px-12 py-4 md:py-5 rounded-full border-2 border-brand-orange hover:border-white transition-all duration-150 transform hover:scale-110 shadow-[0_0_20px_rgba(255,77,0,0.4)]"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};
