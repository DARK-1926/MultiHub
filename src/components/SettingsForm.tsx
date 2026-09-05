"use client";

import React, { useState, useEffect } from "react";
import { Send, Check, UserCheck, Loader2 } from "lucide-react";

export interface SettingsFormProps {
  className?: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ className = "" }) => {
  const [userName, setUserName] = useState("USER");
  const [leetcodeHandle, setLeetcodeHandle] = useState("");
  const [codechefHandles, setCodechefHandles] = useState("");
  const [gfgHandle, setGfgHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/user/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !mounted) return;
        if (data.name) setUserName(data.name.toUpperCase());
        if (data.lc_handle) setLeetcodeHandle(data.lc_handle);
        if (data.cc_handles) setCodechefHandles(data.cc_handles);
        if (data.gfg_handle) setGfgHandle(data.gfg_handle);
        if (data.github_handle) setGithubHandle(data.github_handle);
        if (data.cf_handle) setCodeforcesHandle(data.cf_handle);
        if (data.email) setEmail(data.email);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lc_handle: leetcodeHandle,
          cc_handles: codechefHandles,
          gfg_handle: gfgHandle,
          github_handle: githubHandle,
          cf_handle: codeforcesHandle,
        }),
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3500);
      }
    } catch {
      // silent error fallback
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`border-2 border-borderline bg-surface ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b-2 border-borderline bg-surface font-space">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-brand-orange" />
            <span className="text-xs uppercase font-bold text-brand-orange">
              {userName}&apos;S PROFILE CONFIG
            </span>
          </div>
          <span className="text-[11px] text-ink/50 uppercase">ACCOUNT PANELS</span>
        </div>
        <h3
          className="font-archivo uppercase text-ink tracking-tight"
          style={{
            fontSize: "clamp(1.25rem, 3vw, 2.25rem)",
            lineHeight: 1.0,
          }}
        >
          ACCOUNTS & DISPATCH
        </h3>
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-ink/70 font-space uppercase">
          Configure your connected platform identities and alert notifications.
        </p>
      </div>

      {/* Form with sharp dark inputs */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 font-space bg-paper">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-ink/60 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
            <span>Loading user profile...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="lc-handle"
                  className="block text-xs font-bold uppercase text-ink tracking-tight"
                >
                  LeetCode Handle
                </label>
                <input
                  id="lc-handle"
                  type="text"
                  value={leetcodeHandle}
                  placeholder="Enter your LeetCode handle"
                  onChange={(e) => setLeetcodeHandle(e.target.value)}
                  className="w-full border-2 border-borderline bg-surface px-3 py-2 text-xs md:text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="gh-handle"
                  className="block text-xs font-bold uppercase text-ink tracking-tight"
                >
                  GitHub Handle
                </label>
                <input
                  id="gh-handle"
                  type="text"
                  value={githubHandle}
                  placeholder="Enter your GitHub handle"
                  onChange={(e) => setGithubHandle(e.target.value)}
                  className="w-full border-2 border-borderline bg-surface px-3 py-2 text-xs md:text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cc-handles"
                className="block text-xs font-bold uppercase text-ink tracking-tight"
              >
                CodeChef Accounts (Comma separated for multiple)
              </label>
              <input
                id="cc-handles"
                type="text"
                value={codechefHandles}
                placeholder="e.g. handle_1, handle_2"
                onChange={(e) => setCodechefHandles(e.target.value)}
                className="w-full border-2 border-borderline bg-surface px-3 py-2 text-xs md:text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-brand-orange transition-colors"
              />
              <p className="text-[10px] text-ink/60">
                Each account will be synced and displayed in its own dedicated card.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="gfg-handle"
                  className="block text-xs font-bold uppercase text-ink tracking-tight"
                >
                  GeeksforGeeks Handle
                </label>
                <input
                  id="gfg-handle"
                  type="text"
                  value={gfgHandle}
                  placeholder="Enter your GfG handle"
                  onChange={(e) => setGfgHandle(e.target.value)}
                  className="w-full border-2 border-borderline bg-surface px-3 py-2 text-xs md:text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cf-handle"
                  className="block text-xs font-bold uppercase text-ink tracking-tight"
                >
                  Codeforces (Optional)
                </label>
                <input
                  id="cf-handle"
                  type="text"
                  value={codeforcesHandle}
                  onChange={(e) => setCodeforcesHandle(e.target.value)}
                  placeholder="Leave blank or enter handle..."
                  className="w-full border-2 border-borderline bg-surface px-3 py-2 text-xs md:text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email-field"
                className="block text-xs font-bold uppercase text-ink tracking-tight"
              >
                Account / Alert Email
              </label>
              <input
                id="email-field"
                type="email"
                value={email}
                disabled
                className="w-full border-2 border-borderline bg-surface/50 opacity-70 px-3 py-2 text-xs md:text-sm text-ink cursor-not-allowed"
              />
            </div>

            {/* Submit row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs">
                {isSaved ? (
                  <span className="font-bold text-brand-orange flex items-center gap-1.5 animate-pulse">
                    <Check className="w-4 h-4" />
                    ACCOUNTS PERSISTED SUCCESSFULLY
                  </span>
                ) : (
                  <span className="text-ink/60 uppercase text-[11px]">
                    AUTO-SYNCED ACROSS ALL PLATFORMS
                  </span>
                )}
              </div>

              {/* Pill-shaped submit button */}
              <button
                type="submit"
                disabled={isSaving}
                className="group inline-flex items-center justify-center gap-2 bg-brand-orange text-black hover:bg-white hover:border-white text-xs md:text-sm font-bold uppercase px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border-2 border-brand-orange transition-transform duration-150 transform hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                )}
                <span>{isSaving ? "SAVING..." : "SAVE ACCOUNTS"}</span>
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
