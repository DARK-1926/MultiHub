import React from "react";
import { PlatformStats } from "@/lib/types";
import { PlatformRow } from "./PlatformRow";

export interface PlatformListProps {
  platforms: PlatformStats[];
  className?: string;
}

export const PlatformList: React.FC<PlatformListProps> = ({
  platforms,
  className = "",
}) => {
  return (
    <section
      aria-label="Platform Matrix"
      className={`w-full bg-paper border-b-2 border-borderline ${className}`}
    >
      {/* Section Header */}
      <div className="px-4 sm:px-6 md:px-12 py-3 sm:py-4 border-b-2 border-borderline bg-surface/50 flex items-center justify-between font-space text-xs uppercase text-ink">
        <div className="flex items-center gap-2 font-bold">
          <span className="w-2.5 h-2.5 bg-brand-orange shadow-[0_0_8px_#FF4D00]" />
          <span>CONNECTED ACCOUNT PANELS [0{platforms.length}]</span>
        </div>
        <span className="text-ink/60 hidden sm:inline">
          ISOLATED TELEMETRY FEEDS // LIVE CONCURRENT DISPATCH
        </span>
      </div>

      {/* Separate Panel List Rows */}
      <div className="w-full divide-y-2 divide-borderline">
        {platforms.map((platform, idx) => (
          <PlatformRow
            key={`${platform.platform}-${platform.handle}-${idx}`}
            stats={platform}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
};
