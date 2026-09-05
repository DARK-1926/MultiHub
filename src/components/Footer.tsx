import React from "react";
import Link from "next/link";

export interface FooterProps {
  className?: string;
  userName?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "", userName }) => {
  return (
    <footer
      className={`w-full bg-paper border-t-2 border-borderline py-8 px-6 md:px-12 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-space text-[12px] tracking-tight text-ink">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-brand-orange inline-block shadow-[0_0_8px_#FF4D00]" />
          <span>© 2026 RANKSTACK // HIGH-VELOCITY CP INTELLIGENCE</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 uppercase">
          <Link
            href="https://leetcode.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-orange transition-colors"
          >
            LeetCode
          </Link>
          <Link
            href="https://www.codechef.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-orange transition-colors"
          >
            CodeChef
          </Link>
          <Link
            href="https://geeksforgeeks.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-orange transition-colors"
          >
            GeeksforGeeks
          </Link>
          <Link
            href="https://codeforces.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-orange transition-colors"
          >
            Codeforces
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-orange transition-colors"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
};
