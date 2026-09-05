import React from "react";
import { FloatingNav, NavLinkItem } from "@/components/FloatingNav";
import { LandingHero } from "@/components/LandingHero";
import { SkewedMarquee } from "@/components/SkewedMarquee";
import { GiantCta } from "@/components/GiantCta";
import { Footer } from "@/components/Footer";

const landingLinks: NavLinkItem[] = [
  { label: "Manifesto", href: "#hero" },
  { label: "Platforms", href: "#marquee-section" },
  { label: "Live Feed", href: "#cta" },
  { label: "Sign In", href: "/dashboard" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col selection:bg-brand-orange selection:text-black">
      <FloatingNav links={landingLinks} activeHref="#hero" brandHref="/" />

      <div id="hero">
        <LandingHero />
      </div>

      <div id="marquee-section">
        <SkewedMarquee
          row1Text="CODEFORCES · LEETCODE · CODECHEF · GEEKSFORGEEKS · "
          row2Text="TRACK · STREAK · SYNC · RECOMMEND · "
        />
      </div>

      <div id="cta">
        <GiantCta
          title="START TRACKING"
          buttonText="SIGN IN TO CONTINUE"
          buttonHref="/dashboard"
        />
      </div>

      <Footer />
    </main>
  );
}
