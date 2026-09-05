import React from "react";
import { ArrowDown } from "lucide-react";

export interface RotatingIndicatorProps {
  text?: string;
  icon?: React.ReactNode;
  className?: string;
  idSuffix?: string;
}

export const RotatingIndicator: React.FC<RotatingIndicatorProps> = ({
  text = "SIGN IN • SIGN IN • SIGN IN • SIGN IN • ",
  icon = <ArrowDown className="w-5 h-5 text-ink" />,
  className = "",
  idSuffix = "default",
}) => {
  const pathId = `circle-path-${idSuffix}`;

  return (
    <div
      className={`relative w-[144px] h-[144px] flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      {/* Rotating SVG text container */}
      <svg
        viewBox="0 0 144 144"
        className="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none"
      >
        <defs>
          <path
            id={pathId}
            d="M 72, 72 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
          />
        </defs>
        <text className="font-space font-bold uppercase fill-current text-ink text-[9px] tracking-widest">
          <textPath
            href={`#${pathId}`}
            startOffset="0%"
            textLength="314"
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </textPath>
        </text>
      </svg>

      {/* Static Centered Icon */}
      <div className="relative z-10 flex items-center justify-center w-10 h-10 border-2 border-borderline rounded-full bg-surface text-ink pointer-events-none">
        {icon}
      </div>
    </div>
  );
};
