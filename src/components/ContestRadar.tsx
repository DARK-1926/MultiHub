"use client";

import React, { useState, useEffect } from "react";
import { ContestItem } from "@/lib/types";
import { Calendar, Bell, ExternalLink, Radio, Check, Loader2, X } from "lucide-react";

export interface ContestRadarProps {
  contests: ContestItem[];
  className?: string;
}

type PlatformFilter = "all" | "leetcode" | "codechef" | "codeforces" | "gfg";

export const ContestRadar: React.FC<ContestRadarProps> = ({
  contests,
  className = "",
}) => {
  const [selectedFilter, setSelectedFilter] = useState<PlatformFilter>("all");
  const [alertedContests, setAlertedContests] = useState<Set<string>>(new Set());
  const [now, setNow] = useState<number>(Date.now());
  const [notifyStatus, setNotifyStatus] = useState<Record<string, "loading" | "ok" | "error">>({}); 

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAlert = async (contest: ContestItem) => {
    const { id } = contest;
    const isAlerted = alertedContests.has(id);

    // Toggle local state
    setAlertedContests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    // If enabling alert, fire API
    if (!isAlerted) {
      setNotifyStatus((s) => ({ ...s, [id]: "loading" }));
      try {
        const res = await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "contest",
            data: {
              name: contest.name,
              platform: contest.platform,
              startTime: contest.startTime,
              url: contest.url,
              durationSeconds: contest.durationSeconds,
            },
          }),
        });
        const json = await res.json();
        setNotifyStatus((s) => ({ ...s, [id]: json.ok ? "ok" : "error" }));
      } catch {
        setNotifyStatus((s) => ({ ...s, [id]: "error" }));
      }
      // Reset status after 4 seconds
      setTimeout(() => setNotifyStatus((s) => { const n = { ...s }; delete n[id]; return n; }), 4000);
    }
  };

  const filteredContests =
    selectedFilter === "all"
      ? contests
      : contests.filter((c) => c.platform === selectedFilter);

  const formatCountdown = (startTimeStr: string) => {
    const diff = new Date(startTimeStr).getTime() - now;
    if (diff <= 0) return "LIVE NOW";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}D ${hours}H ${minutes}M`;
    return `${hours}H ${minutes}M ${seconds}S`;
  };

  return (
    <section
      id="contests"
      aria-label="Contest Schedule and Notifications"
      className={`w-full bg-paper border-b-2 border-borderline p-6 md:p-12 ${className}`}
    >
      <div className="border-2 border-borderline bg-surface">
        {/* Header */}
        <div className="p-6 border-b-2 border-borderline flex flex-col md:flex-row md:items-center justify-between gap-4 font-space">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-brand-orange animate-pulse" />
            <div>
              <h3 className="font-archivo uppercase text-xl md:text-2xl tracking-tight text-ink">
                CONTEST TELEMETRY RADAR
              </h3>
              <p className="text-[11px] uppercase text-ink/70">
                UPCOMING ROUNDS & DEDICATED PLATFORM DISPATCH
              </p>
            </div>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(["all", "leetcode", "codechef", "codeforces", "gfg"] as PlatformFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1 uppercase font-bold border-2 transition-colors ${
                  selectedFilter === tab
                    ? "bg-brand-orange text-black border-brand-orange font-bold"
                    : "bg-paper text-ink border-borderline hover:border-brand-orange hover:text-brand-orange"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contest List Grid */}
        <div className="divide-y-2 divide-borderline">
          {filteredContests.length === 0 ? (
            <div className="p-8 text-center font-space text-sm text-ink/60 uppercase">
              No upcoming scheduled rounds in this category.
            </div>
          ) : (
            filteredContests.map((contest) => {
              const isAlerted = alertedContests.has(contest.id);
              const nStatus = notifyStatus[contest.id];
              const startDate = new Date(contest.startTime);
              const durationHours = (contest.durationSeconds / 3600).toFixed(1);

              return (
                <div
                  key={contest.id}
                  className="p-6 hover:bg-white/[0.03] transition-colors font-space flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Platform Badge, Title & Timing */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="border-2 border-borderline bg-paper px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                        {contest.platform}
                      </span>
                      <span className="text-[11px] text-brand-orange font-bold uppercase">
                        DURATION: {durationHours}H
                      </span>
                    </div>

                    <h4 className="font-archivo uppercase text-base md:text-xl text-ink tracking-tight truncate mb-1">
                      {contest.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink/70">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                        <span>
                          {startDate.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          ·{" "}
                          {startDate.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Countdown & Actions */}
                  <div className="flex flex-wrap items-center gap-4 lg:flex-shrink-0">
                    {/* Countdown Timer */}
                    <div className="border-2 border-borderline bg-paper px-4 py-2 text-center min-w-[130px]">
                      <div className="text-[9px] text-ink/60 font-bold uppercase">
                        STARTS IN
                      </div>
                      <div className="text-sm font-bold text-brand-orange">
                        {formatCountdown(contest.startTime)}
                      </div>
                    </div>

                    {/* Alert Notification Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleAlert(contest)}
                      disabled={nStatus === "loading"}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 text-xs font-bold uppercase transition-all duration-150 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait ${
                        nStatus === "ok"
                          ? "bg-green-600 text-white border-green-600 shadow-[0_0_10px_#22c55e]"
                          : nStatus === "error"
                          ? "bg-red-600 text-white border-red-600"
                          : isAlerted
                          ? "bg-brand-orange text-black border-brand-orange font-bold shadow-[0_0_10px_#FF4D00]"
                          : "bg-surface text-ink border-borderline hover:border-white hover:text-white"
                      }`}
                    >
                      {nStatus === "loading" ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>SENDING...</span></>
                      ) : nStatus === "ok" ? (
                        <><Check className="w-3.5 h-3.5" /><span>EMAIL SENT</span></>
                      ) : nStatus === "error" ? (
                        <><X className="w-3.5 h-3.5" /><span>FAILED</span></>
                      ) : isAlerted ? (
                        <><Check className="w-3.5 h-3.5" /><span>ALERT ARMED</span></>
                      ) : (
                        <><Bell className="w-3.5 h-3.5" /><span>NOTIFY ME</span></>
                      )}
                    </button>

                    {/* External Link Button */}
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 border-brand-orange bg-brand-orange text-black hover:bg-white hover:border-white text-xs font-bold uppercase transition-transform duration-150 transform hover:scale-105"
                    >
                      <span>REGISTER</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
