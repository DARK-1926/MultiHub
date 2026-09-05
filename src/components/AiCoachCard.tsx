"use client";

import React, { useState, useRef, useEffect } from "react";
import { Recommendation } from "@/lib/types";
import { Sparkles, ExternalLink, RefreshCw, Send, MessageSquare, Target, User, Bot, Zap } from "lucide-react";

export interface AiCoachCardProps {
  initialRecommendations: Recommendation[];
  className?: string;
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
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
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "picks">("chat");

  // Daily Picks State
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Chat State
  const [selectedModel, setSelectedModel] = useState<"groq" | "gemini">("groq");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to your CP Command Center. Have you solved your daily target problem today, or are you slacking off? Tell me what problem or platform you want to conquer right now.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      <div className="p-6 border-b-2 border-borderline bg-surface font-space">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
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
              className={`px-3 py-1 uppercase font-bold border-2 transition-colors flex items-center gap-1.5 ${
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
              className={`px-3 py-1 uppercase font-bold border-2 transition-colors flex items-center gap-1.5 ${
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
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            lineHeight: 0.9,
          }}
        >
          {activeTab === "chat" ? "AI COACH & ACCOUNTABILITY GUIDE" : "COACH RECOMMENDATIONS"}
        </h3>
        <p className="mt-2 text-xs text-ink/70 font-space uppercase">
          {activeTab === "chat"
            ? "Live mentor keeping you in check, sharpening your algorithmic intuition, and steering you to 1600+."
            : "Targeted 1461 → 1600+ CodeChef & LeetCode medium/hard problem sequencing."}
        </p>

        {/* Inference Model Toggle (Chat Mode Only) */}
        {activeTab === "chat" && (
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t-2 border-borderline">
            <span className="text-[10px] font-bold text-ink/60 uppercase tracking-wider">
              INFERENCE MODEL:
            </span>
            <div className="inline-flex rounded border-2 border-borderline p-0.5 bg-paper gap-1">
              <button
                type="button"
                onClick={() => setSelectedModel("groq")}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all rounded flex items-center gap-1.5 ${
                  selectedModel === "groq"
                    ? "bg-brand-orange text-black font-extrabold shadow-[0_0_12px_rgba(255,77,0,0.45)]"
                    : "text-ink/60 hover:text-ink hover:bg-white/5"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>GROQ ⚡ (QWEN 3.8 / OSS)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("gemini")}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all rounded flex items-center gap-1.5 ${
                  selectedModel === "gemini"
                    ? "bg-brand-orange text-black font-extrabold shadow-[0_0_12px_rgba(255,77,0,0.45)]"
                    : "text-ink/60 hover:text-ink hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>GEMINI ✨ (2.5 FLASH)</span>
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
        <div className="flex flex-col flex-1 min-h-[380px] bg-paper">
          {/* Quick Prompt Chips */}
          <div className="p-3 border-b-2 border-borderline bg-surface/50 flex items-center gap-2 overflow-x-auto text-[11px] font-space">
            <span className="text-ink/40 font-bold uppercase whitespace-nowrap">PROMPTS:</span>
            <button
              type="button"
              onClick={() => handleSendMessage("How do I improve my rating on CodeChef and reach 3★?")}
              className="border border-borderline bg-paper px-2.5 py-1 text-ink/80 hover:text-brand-orange hover:border-brand-orange whitespace-nowrap transition-colors"
            >
              🎯 Rating Improvement Strategy
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Check my daily progress and streak. Am I slacking?")}
              className="border border-borderline bg-paper px-2.5 py-1 text-ink/80 hover:text-brand-orange hover:border-brand-orange whitespace-nowrap transition-colors"
            >
              ⚡ Keep Me In Check
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("How do I transition from LeetCode Mediums to solve Hards reliably?")}
              className="border border-borderline bg-paper px-2.5 py-1 text-ink/80 hover:text-brand-orange hover:border-brand-orange whitespace-nowrap transition-colors"
            >
              🧠 Medium to Hard Strategy
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Give me a targeted contest drill plan for upcoming rounds.")}
              className="border border-borderline bg-paper px-2.5 py-1 text-ink/80 hover:text-brand-orange hover:border-brand-orange whitespace-nowrap transition-colors"
            >
              ⚔️ Contest Drill Plan
            </button>
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
