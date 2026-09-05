"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Terminal, LogOut, User as UserIcon } from "lucide-react";

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface FloatingNavProps {
  links: NavLinkItem[];
  activeHref?: string;
  brandHref?: string;
  userName?: string;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  links,
  activeHref,
  brandHref = "/",
  userName,
}) => {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="pointer-events-auto">
          <Link
            href={brandHref}
            className="group inline-flex items-center gap-2 text-ink"
          >
            <span className="w-3 h-3 bg-brand-orange inline-block shadow-[0_0_12px_#FF4D00]" />
            <span className="font-archivo text-lg md:text-xl tracking-tighter uppercase text-ink">
              RANKSTACK
            </span>
          </Link>
        </div>

        {/* Center: Floating Pill Nav (Black Brutalist Glass / Surface) */}
        <nav
          aria-label="Main Navigation"
          className="pointer-events-auto bg-surface/90 backdrop-blur-md text-ink rounded-full px-2 py-1.5 md:px-4 md:py-2 border-2 border-borderline shadow-nav-depth flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[65vw] sm:max-w-none"
        >
          {links.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-space text-[11px] md:text-[12px] tracking-tight uppercase whitespace-nowrap px-2.5 py-1 rounded-full transition-colors duration-150 ${
                  isActive
                    ? "bg-brand-orange text-black font-bold"
                    : "text-ink/80 hover:bg-white/10 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Social & System Icons or User / Logout */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3">
          {userName ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-borderline text-[11px] font-space text-ink/90">
                <UserIcon className="w-3 h-3 text-brand-orange" />
                <span className="max-w-[100px] truncate">{userName}</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Log out"
                className="p-2 border-2 border-borderline text-ink bg-surface hover:border-red-500 hover:text-red-500 transition-colors duration-150 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 border-2 border-borderline text-ink bg-surface hover:border-brand-orange hover:text-brand-orange font-space text-[11px] font-bold uppercase transition-colors duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 bg-brand-orange text-black hover:bg-white font-space text-[11px] font-bold uppercase transition-colors duration-150"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
