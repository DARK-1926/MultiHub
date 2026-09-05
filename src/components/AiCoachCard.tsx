"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Recommendation, PlatformStats, StreakData } from "@/lib/types";
import { Sparkles, ExternalLink, RefreshCw, Send, MessageSquare, Target, User, Bot, Zap, Flame, ShieldAlert } from "lucide-react";

export interface AiCoachCardProps {
  initialRecommendations: Recommendation[];
  platforms?: PlatformStats[];
  streakData?: StreakData;
  userName?: string;
  className?: string;
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface PersonaPrompt {
  tag: string;
  label: string;
  prompt: string;
  icon?: string;
}

function getPersonaPrompts(
  platforms?: PlatformStats[],
  streakData?: StreakData,
  userName?: string
): PersonaPrompt[] {
  const prompts: PersonaPrompt[] = [];

  const cc = platforms?.find((p) => p.platform === "codechef");
  const lc = platforms?.find((p) => p.platform === "leetcode");
  const cf = platforms?.find((p) => p.platform === "codeforces" && p.handle !== "pending_setup");
  const streak = streakData?.currentStreak ?? 0;

  // Extract recent solved problem titles from LeetCode or Codeforces
  const recentSolves = [
    ...(lc?.recentSubmissions || []),
    ...(cf?.recentSubmissions || []),
  ];
  const latestSolve = recentSolves[0];
  const secondSolve = recentSolves[1];

  // 1. CodeChef Rating Gap & Starters 255 Sprint
  if (cc && cc.rating) {
    if (cc.rating < 1600) {
      const gap = 1600 - cc.rating;
      prompts.push({
        tag: `🎯 ${cc.rating} → 3★ (-${gap} pts)`,
        label: `Bridge ${gap} pts to 3★`,
        prompt: `I am currently rated ${cc.rating} on CodeChef (@${cc.handle}). How do I bridge the ${gap}-point gap to hit 3★ (1600) in Starters 255? Give me the exact Problem C patterns (Binary Search on Answer, 1D DP, Two Pointers) I need to drill.`,
      });
    } else {
      prompts.push({
        tag: `⚔️ CC ${cc.rating} → 4★`,
        label: `Push to 4★ (1800+)`,
        prompt: `I am rated ${cc.rating} on CodeChef (@${cc.handle}). What Div 2 contest speed and graph/DP techniques should I focus on to push past 1800+ in upcoming Starters?`,
      });
    }
  } else {
    prompts.push({
      tag: `⚔️ Starters 255 Drill`,
      label: `Starters 255 Strategy`,
      prompt: `Give me a targeted contest speed strategy for CodeChef Starters 255. How should I allocate my 2 hours across Problems A through D?`,
    });
  }

  // 2. Hyper-Specific Recent Solved Problem Drill (No generic question)
  if (latestSolve) {
    const truncatedTitle = latestSolve.length > 20 ? `${latestSolve.slice(0, 18)}...` : latestSolve;
    prompts.push({
      tag: `🔥 "${truncatedTitle}"`,
      label: `Master "${truncatedTitle}"`,
      prompt: `I recently solved "${latestSolve}". What are the trickiest edge cases, time-complexity pitfalls, and harder follow-up variations of this problem that contest setters use?`,
    });
  }

  // 3. LeetCode Difficulty Breakdown & Ratio Balancing
  if (lc?.difficultyBreakdown) {
    const { easy, medium, hard } = lc.difficultyBreakdown;
    prompts.push({
      tag: `🧠 ${medium}M / ${hard}H Ratio`,
      label: `Convert Mediums to Hards`,
      prompt: `My LeetCode stats are ${easy} Easy, ${medium} Medium, and ${hard} Hard (${lc.problemsSolved} total). Analyze my ratio: am I plateauing on Mediums, and what specific sub-topics should I drill to solve Hards reliably under 25 minutes?`,
    });
  } else if (lc?.problemsSolved) {
    prompts.push({
      tag: `🧠 ${lc.problemsSolved} LC Solves`,
      label: `Level up LeetCode Solves`,
      prompt: `I have solved ${lc.problemsSolved} problems on LeetCode (@${lc.handle}). What algorithmic patterns should I focus on right now to shift toward contest-level speed?`,
    });
  }

  // 4. Codeforces or Next Problem Pattern
  if (cf && cf.rating) {
    prompts.push({
      tag: `⚡ CF ${cf.rating} Push`,
      label: `Push to Specialist`,
      prompt: `My Codeforces rating is ${cf.rating}. How can I improve my speed and penalty points on Div 3/Div 2 Problems A, B, and C?`,
    });
  } else if (secondSolve) {
    const truncatedSecond = secondSolve.length > 20 ? `${secondSolve.slice(0, 18)}...` : secondSolve;
    prompts.push({
      tag: `💡 "${truncatedSecond}"`,
      label: `Analyze "${truncatedSecond}"`,
      prompt: `Analyze the algorithmic paradigm behind "${secondSolve}". What adjacent data structures or tricks should I practice next?`,
    });
  }

  // 5. Active Streak & Accountability
  if (streak > 0) {
    prompts.push({
      tag: `🔥 ${streak}-Day Streak Audit`,
      label: `Preserve Streak Today`,
      prompt: `I'm on a ${streak}-day streak across my platforms. Audit my daily intensity: what is 1 high-impact problem I must solve today to maintain genuine skill growth, not just a vanity streak?`,
    });
  } else {
    prompts.push({
      tag: `⚡ Day 1 Momentum`,
      label: `Reignite Streak`,
      prompt: `My active streak is at 0 days. Give me a concrete, non-trivial problem right now to reignite my daily problem-solving momentum.`,
    });
  }

  return prompts;
}

function buildInitialGreeting(
  userName?: string,
  platforms?: PlatformStats[],
  streakData?: StreakData
): string {
  const firstName = userName ? userName.split(" ")[0] : "Competitor";
  const cc = platforms?.find((p) => p.platform === "codechef");
  const lc = platforms?.find((p) => p.platform === "leetcode");
  const latestSolve = lc?.recentSubmissions?.[0] || platforms?.find((p) => p.recentSubmissions?.[0])?.recentSubmissions?.[0];
  const streak = streakData?.currentStreak ?? 0;

  const telemetryParts: string[] = [];
  if (cc?.rating) {
    telemetryParts.push(`**CodeChef:** ${cc.rating} (${cc.rating < 1600 ? `${1600 - cc.rating} pts to 3★` : "3★ Active"})`);
  }
  if (lc?.difficultyBreakdown) {
    telemetryParts.push(`**LeetCode:** ${lc.difficultyBreakdown.medium}M / ${lc.difficultyBreakdown.hard}H`);
  }
  if (latestSolve) {
    telemetryParts.push(`**Latest Solve:** \`${latestSolve}\``);
  }
  if (streak > 0) {
    telemetryParts.push(`**Active Streak:** ${streak} Days 🔥`);
  }

  const telemetrySnippet = telemetryParts.length > 0
    ? `\n\n*Live Telemetry Hooked In:*\n- ${telemetryParts.join("\n- ")}`
    : "";

  return `Welcome ${firstName}. I have full visibility into your live ratings, solve breakdown, and recent submissions.${telemetrySnippet}\n\nHave you solved your daily target problem today, or are you slacking off? Select a custom drill above or ask anything about your trajectory.`;
}

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");

  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }

    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="font-bold text-brand-orange uppercase text-xs mt-2 mb-1 tracking-wider">
          {line.replace("### ", "")}
        </h4>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h3 key={idx} className="font-bold text-white uppercase text-sm mt-2.5 mb-1.5 tracking-wide">
          {line.replace("## ", "")}
        </h3>
      );
    }

    const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
    const isNumbered = /^\d+\.\s/.test(line.trim());

    const rawText = isBullet
      ? line.trim().substring(2)
      : isNumbered
      ? line.trim().replace(/^\d+\.\s/, "")
      : line;

    const parts = rawText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    const formattedInline = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={pIdx} className="font-bold text-brand-orange">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={pIdx} className="bg-black/60 px-1 py-0.5 rounded text-[11px] font-mono text-orange-300 border border-borderline">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-2 ml-1 my-1">
          <span className="text-brand-orange font-bold text-xs mt-0.5">•</span>
          <div className="flex-1 leading-relaxed">{formattedInline}</div>
        </div>
      );
    }

    if (isNumbered) {
      const match = line.trim().match(/^(\d+)\.\s/);
      const num = match ? match[1] : "1";
      return (
        <div key={idx} className="flex items-start gap-2 ml-1 my-1">
          <span className="text-brand-orange font-bold text-xs min-w-[14px] mt-0.5">{num}.</span>
          <div className="flex-1 leading-relaxed">{formattedInline}</div>
        </div>
      );
    }

    return (
      <p key={idx} className="my-1 leading-relaxed">
        {formattedInline}
      </p>
    );
  });
}

export const AiCoachCard: React.FC<AiCoachCardProps> = ({
  initialRecommendations,
  platforms = [],
  streakData,
  userName,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "picks">("chat");

  // Dynamic persona prompts calculated from user's live platform telemetry
  const personaPrompts = useMemo(
    () => getPersonaPrompts(platforms, streakData, userName),
    [platforms, streakData, userName]
  );

  const initialGreeting = useMemo(
    () => buildInitialGreeting(userName, platforms, streakData),
    [userName, platforms, streakData]
  );

  // Daily Picks State
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Chat State
  const [selectedModel, setSelectedModel] = useState<"groq" | "gemini">("groq");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: initialGreeting,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync greeting when live platform stats load
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: initialGreeting }];
      }
      return prev;
    });
  }, [initialGreeting]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleRefreshPicks = async () => {
    setIsRefreshing(true);
    setStatusNotice("AI ANALYZING CURRENT RATING & RECENT SOLVES...");
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setStatusNotice("AI PICKS SYNCED · GEMINI 2.5 FLASH");
        } else {
          setStatusNotice("CURATED PICKS SYNCED");
        }
      } else {
        setStatusNotice("USING CURATED PICKS");
      }
    } catch {
      setStatusNotice("USING CURATED PICKS");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async (textOrEvent?: string | React.FormEvent) => {
    if (typeof textOrEvent === "object" && textOrEvent && "preventDefault" in textOrEvent) {
      textOrEvent.preventDefault();
    }
    const textToSend = typeof textOrEvent === "string" ? textOrEvent : inputMessage;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg = textToSend.trim();
    if (typeof textOrEvent !== "string") {
      setInputMessage("");
    }
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          model: selectedModel,
          history: messages,
          platforms,
          streakData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Keep grinding. Stay disciplined and hit your targets." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Maintain focus. Solve 1 Contest-level problem and 1 Medium algorithm before tonight. That's how you level up.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection blip, but no excuses. Open your code editor and solve a tree DP problem.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`border-2 border-borderline bg-surface flex flex-col justify-between ${className}`}
    >
      {/* Header with Mode Switcher */}
      <div className="p-4 sm:p-6 border-b-2 border-borderline bg-surface font-space">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span className="text-xs uppercase font-bold text-brand-orange">
              AI CP COACH // MENTOR PROTOCOL
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1 uppercase font-bold text-[11px] sm:text-xs border-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-brand-orange text-black border-brand-orange"
                  : "bg-paper text-ink border-borderline hover:border-brand-orange hover:text-brand-orange"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>COACH CHAT</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("picks")}
              className={`px-2.5 py-1 sm:px-3 sm:py-1 uppercase font-bold text-[11px] sm:text-xs border-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "picks"
                  ? "bg-brand-orange text-black border-brand-orange"
                  : "bg-paper text-ink border-borderline hover:border-brand-orange hover:text-brand-orange"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>DAILY PICKS</span>
            </button>
          </div>
        </div>

        <h3
          className="font-archivo uppercase text-ink tracking-tight"
          style={{
            fontSize: "clamp(1.25rem, 3vw, 2.25rem)",
            lineHeight: 1.0,
          }}
        >
          {activeTab === "chat" ? "AI COACH & ACCOUNTABILITY GUIDE" : "COACH RECOMMENDATIONS"}
        </h3>
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-ink/70 font-space uppercase">
          {activeTab === "chat"
            ? "Live mentor keeping you in check, sharpening your algorithmic intuition, and steering you to 1600+."
            : "Targeted CodeChef & LeetCode medium/hard problem sequencing."}
        </p>

        {/* Inference Model Toggle (Chat Mode Only) */}
        {activeTab === "chat" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 pt-3 border-t-2 border-borderline">
            <span className="text-[10px] font-bold text-ink/60 uppercase tracking-wider">
              INFERENCE MODEL:
            </span>
            <div className="grid grid-cols-2 sm:inline-flex rounded border-2 border-borderline p-0.5 bg-paper gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedModel("groq")}
                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all rounded flex items-center justify-center gap-1 sm:gap-1.5 ${
                  selectedModel === "groq"
                    ? "bg-brand-orange text-black font-extrabold shadow-[0_0_12px_rgba(255,77,0,0.45)]"
                    : "text-ink/60 hover:text-ink hover:bg-white/5"
                }`}
              >
                <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">GROQ ⚡ (QWEN)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("gemini")}
                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all rounded flex items-center justify-center gap-1 sm:gap-1.5 ${
                  selectedModel === "gemini"
                    ? "bg-brand-orange text-black font-extrabold shadow-[0_0_12px_rgba(255,77,0,0.45)]"
                    : "text-ink/60 hover:text-ink hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">GEMINI ✨ (FLASH)</span>
              </button>
            </div>
            <span className="text-[10px] text-brand-orange font-bold uppercase hidden md:inline ml-auto">
              {selectedModel === "groq" ? "⚡ ULTRA-FAST LPU ACCELERATION" : "✨ MULTI-TURN DEEP REASONING"}
            </span>
          </div>
        )}
      </div>

      {/* Mode 1: Interactive Coach Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-col flex-1 min-h-[360px] sm:min-h-[380px] bg-paper">
          {/* Dynamic Persona Prompt Chips */}
          <div className="p-2 sm:p-3 border-b-2 border-borderline bg-surface/50 flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-[10px] sm:text-[11px] font-space [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-ink/50 font-bold uppercase whitespace-nowrap text-[10px] flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3 h-3 text-brand-orange" />
              <span>CUSTOM DRILLS:</span>
            </span>
            {personaPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.prompt)}
                title={p.prompt}
                className="group border border-borderline bg-paper px-2 sm:px-2.5 py-1 text-ink/80 hover:text-black hover:bg-brand-orange hover:border-brand-orange whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <span className="font-bold text-brand-orange group-hover:text-black transition-colors">{p.tag}</span>
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[340px] space-y-3 font-space text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-brand-orange text-black flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 max-w-[88%] border-2 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-orange text-black border-brand-orange font-medium"
                      : "bg-surface text-ink border-borderline"
                  }`}
                >
                  {msg.role === "user" ? msg.content : renderMarkdown(msg.content)}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-brand-orange text-black flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-surface text-brand-orange border-2 border-borderline flex items-center gap-2 font-bold animate-pulse">
                  <span>
                    ANALYZING WITH {selectedModel === "groq" ? "GROQ ⚡ (QWEN 3.8 / OSS)" : "GEMINI ✨ (2.5 FLASH)"}...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t-2 border-borderline bg-surface flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach anything or report today's practice..."
              disabled={isChatLoading}
              className="flex-1 border-2 border-borderline bg-paper px-3 py-2 text-xs md:text-sm text-ink focus:outline-none focus:border-brand-orange transition-colors font-space"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isChatLoading || !inputMessage.trim()}
              className="inline-flex items-center gap-1.5 bg-brand-orange text-black font-space text-xs font-bold uppercase px-4 py-2.5 rounded-full border-2 border-brand-orange hover:bg-white hover:border-white transition-all disabled:opacity-40"
            >
              <span>SEND</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Daily Picks */}
      {activeTab === "picks" && (
        <div>
          <div className="divide-y-2 divide-borderline bg-paper">
            {recommendations.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-5 hover:bg-white/[0.04] transition-colors font-space flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-brand-orange">
                      0{idx + 1}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-sm text-ink hover:text-brand-orange transition-colors flex items-center gap-1.5"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-ink/40 hover:text-brand-orange" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                    <span className="border border-borderline px-1.5 py-0.5 uppercase font-bold text-ink">
                      {item.platform}
                    </span>
                    <span className="border border-brand-orange px-1.5 py-0.5 uppercase font-bold text-brand-orange">
                      {item.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-ink/80 font-sans pl-5 leading-relaxed">
                  <span className="font-space font-bold uppercase text-[10px] text-ink/50 mr-1">
                    REASON:
                  </span>
                  {item.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 border-t-2 border-borderline bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-space text-xs text-ink">
              {statusNotice ? (
                <span className="font-bold text-brand-orange animate-pulse">
                  {statusNotice}
                </span>
              ) : (
                <span className="text-ink/60 uppercase">
                  AI ENGINE: <span className="font-bold text-brand-orange">GEMINI 2.5 FLASH ACTIVE</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRefreshPicks}
              disabled={isRefreshing}
              className="group inline-flex items-center gap-2 bg-brand-orange text-black hover:bg-white hover:border-white font-space text-xs font-bold uppercase px-6 py-3 rounded-full border-2 border-brand-orange transition-transform duration-150 transform hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "ANALYZING..." : "GET TODAY'S PICKS"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
