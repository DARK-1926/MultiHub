import React from "react";

export interface SkewedMarqueeProps {
  row1Text?: string;
  row2Text?: string;
  className?: string;
}

export const SkewedMarquee: React.FC<SkewedMarqueeProps> = ({
  row1Text = "LEETCODE · CODECHEF · GEEKSFORGEEKS · GITHUB · CODEFORCES · ",
  row2Text = "TRACK · STREAK · RADAR · RECOMMEND · REPOSITORIES · ",
  className = "",
}) => {
  const fullRow1 = row1Text.repeat(6);
  const fullRow2 = row2Text.repeat(6);

  return (
    <section
      aria-label="Platform Highlights Marquee"
      className={`relative w-full overflow-hidden bg-surface py-10 md:py-16 select-none border-y-2 border-borderline ${className}`}
    >
      <div className="-skew-y-2 scale-105 transform">
        {/* Row 1: Orange Archivo Black headline */}
        <div className="flex w-full overflow-hidden mb-2 md:mb-4">
          <div className="flex w-max animate-marquee">
            <span
              className="font-archivo uppercase text-brand-orange whitespace-nowrap tracking-tight pr-4 drop-shadow-[0_0_12px_rgba(255,77,0,0.3)]"
              style={{ fontSize: "clamp(2rem, 10vw, 6.5rem)", lineHeight: 0.9 }}
            >
              {fullRow1}
            </span>
            <span
              className="font-archivo uppercase text-brand-orange whitespace-nowrap tracking-tight pr-4 drop-shadow-[0_0_12px_rgba(255,77,0,0.3)]"
              style={{ fontSize: "clamp(2rem, 10vw, 6.5rem)", lineHeight: 0.9 }}
              aria-hidden="true"
            >
              {fullRow1}
            </span>
          </div>
        </div>

        {/* Row 2: White text */}
        <div className="flex w-full overflow-hidden">
          <div className="flex w-max animate-marquee-reverse">
            <span
              className="font-space font-bold uppercase text-ink/80 whitespace-nowrap tracking-tight pr-4"
              style={{ fontSize: "clamp(1.25rem, 5vw, 3.5rem)", lineHeight: 1 }}
            >
              {fullRow2}
            </span>
            <span
              className="font-space font-bold uppercase text-ink/80 whitespace-nowrap tracking-tight pr-4"
              style={{ fontSize: "clamp(1.25rem, 5vw, 3.5rem)", lineHeight: 1 }}
              aria-hidden="true"
            >
              {fullRow2}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
