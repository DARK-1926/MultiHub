import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PlatformStats, StreakData } from "@/lib/types";
import { fetchAllPlatformStats, fetchRealStreakData } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return NextResponse.json(
      { reply: "AI Key not detected. Please configure GEMINI_API_KEY or GROQ_API_KEY in .env.local." },
      { status: 500 }
    );
  }

  try {
    const user = await getCurrentUser().catch(() => null);
    const userName = user?.name || "Competitor";

    const body = await req.json();
    const userMessage = body.message || "What should I focus on right now?";
    const conversationHistory = body.history || [];
    const requestedModel = (body.model || "groq").toLowerCase(); // "groq" | "gemini"

    // ── Ingest live telemetry from client body or fetch if absent ──────────
    let platforms: PlatformStats[] = Array.isArray(body.platforms) ? body.platforms : [];
    let streakData: StreakData | undefined = body.streakData;

    if (platforms.length === 0 && user) {
      const customHandles = {
        leetcode: user.lc_handle || "",
        codechef: user.cc_handles?.length ? user.cc_handles : [],
        gfg: user.gfg_handle || "",
        codeforces: user.cf_handle || "",
        github: user.github_handle || "",
      };
      platforms = await fetchAllPlatformStats(customHandles).catch(() => []);
      streakData = await fetchRealStreakData(customHandles).catch(() => undefined);
    }

    const now = new Date();
    // Exact countdown to CodeChef Starters 255 (Wed Sep 9, 2026, 8:00 PM IST)
    const starters255 = new Date("2026-09-09T20:00:00+05:30");
    const diffMs = starters255.getTime() - now.getTime();
    const daysUntilStarters = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const hoursUntilStarters = Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24));
    const countdownStr = `${daysUntilStarters} days and ${hoursUntilStarters} hours`;

    // ── Extract Platform Specifics ─────────────────────────────────────────
    const ccAccounts = platforms.filter((p) => p.platform === "codechef");
    let ccDossier = "Not connected";
    if (ccAccounts.length > 0) {
      ccDossier = ccAccounts
        .map((cc, i) => {
          const ratingStr = cc.rating ? `${cc.rating} (${cc.rank || "Div 3"})` : "Unrated";
          const maxStr = cc.maxRating ? ` [Peak: ${cc.maxRating}]` : "";
          const targetStr =
            cc.rating && cc.rating < 1600
              ? ` -> TARGET: ${1600 - cc.rating} pts needed to hit 3★ (1600)`
              : cc.rating
              ? ` -> 3★+ Active`
              : "";
          return `Account ${i + 1} (@${cc.handle}): Rating ${ratingStr}${maxStr}, ${cc.problemsSolved} Solved${targetStr}`;
        })
        .join("\n  * ");
    }

    const lc = platforms.find((p) => p.platform === "leetcode");
    let lcDossier = "Not connected";
    if (lc) {
      const b = lc.difficultyBreakdown;
      const bStr = b ? ` (${b.easy} Easy, ${b.medium} Medium, ${b.hard} Hard)` : "";
      const recent = lc.recentSubmissions?.length
        ? `\n  * Latest Solved Problems: ${lc.recentSubmissions.map((s) => `"${s}"`).join(", ")}`
        : "";
      const ratingStr = lc.rating ? `Contest Rating: ${lc.rating} (${lc.rank || "Active"})` : `Rank: ${lc.rank || "Active"}`;
      lcDossier = `Handle @${lc.handle}: ${lc.problemsSolved} Solved${bStr} | ${ratingStr}${recent}`;
    }

    const cf = platforms.find((p) => p.platform === "codeforces");
    let cfDossier = "Not connected";
    if (cf && cf.handle !== "pending_setup") {
      const recent = cf.recentSubmissions?.length
        ? `\n  * Latest Solved: ${cf.recentSubmissions.map((s) => `"${s}"`).join(", ")}`
        : "";
      cfDossier = `Handle @${cf.handle}: Rating ${cf.rating || "Unrated"} (${cf.rank || "Active"}) | ${cf.problemsSolved} Solved${recent}`;
    }

    const gfg = platforms.find((p) => p.platform === "gfg");
    let gfgDossier = "Not connected";
    if (gfg) {
      const b = gfg.difficultyBreakdown;
      const bStr = b ? ` (${b.easy} Easy/Basic, ${b.medium} Medium, ${b.hard} Hard)` : "";
      const recent = gfg.recentSubmissions?.length
        ? `\n  * Latest Solved: ${gfg.recentSubmissions.map((s) => `"${s}"`).join(", ")}`
        : "";
      gfgDossier = `Handle @${gfg.handle}: ${gfg.problemsSolved} Solved${bStr} | ${gfg.rank || "Active"}${recent}`;
    }

    const gh = platforms.find((p) => p.platform === "github");
    const ghDossier = gh && gh.handle !== "Not Connected"
      ? `Handle @${gh.handle}: ${gh.problemsSolved} Commits | ${gh.rank || "Active"}`
      : "Not connected";

    const currentStreak = streakData?.currentStreak ?? 0;
    const longestStreak = streakData?.longestStreak ?? 0;
    const totalSolves = platforms.reduce((acc, p) => acc + (p.problemsSolved || 0), 0);

    const systemPrompt = `
You are RankStack AI Coach — an elite, hyper-personalized Competitive Programming mentor for ${userName}.
You have direct real-time telemetry access to ${userName}'s exact ratings, solve history, streak metrics, and recent problems solved.

${userName.toUpperCase()}'S LIVE TELEMETRY DOSSIER:
- Total Cumulative Solves Across Platforms: ${totalSolves}
- Current Active Streak: ${currentStreak} Days (All-Time Record: ${longestStreak} Days)
- Upcoming Major Contest: CodeChef Starters 255 in EXACTLY ${countdownStr} (Starts in ${daysUntilStarters}D ${hoursUntilStarters}H)

CONNECTED PLATFORMS & RECENT SOLVES:
- CodeChef:
  * ${ccDossier}
- LeetCode:
  * ${lcDossier}
- Codeforces:
  * ${cfDossier}
- GeeksforGeeks:
  * ${gfgDossier}
- GitHub:
  * ${ghDossier}

COACHING RULES & PERSONA INSTRUCTIONS:
1. NEVER GIVE GENERIC ADVICE: Reference ${userName}'s exact statistics. If they ask how to improve, cite their actual CodeChef rating, their LeetCode difficulty ratio (e.g. Mediums vs Hards), or their actual recent problem solves.
2. TAILORED STRATEGY:
   - For CodeChef: Emphasize Div 3 Problem C requirements (Binary Search on Answer, 1D DP, Two Pointers, Greedy with Sorting) to bridge into 3★ (1600).
   - For LeetCode: Analyze their solve distribution and suggest advanced sub-patterns to convert Medium mastery into Hard solves.
3. REFERENCE RECENT SOLVES: If recent solved problems are listed in their dossier, draw direct connections to them.
4. CONTEST SPRINT: Remember Starters 255 is strictly in ${daysUntilStarters} days (${countdownStr}). Advise on contest speed drills.
5. CLEAN MARKDOWN FORMATTING:
   - Use bold headers, bullet lists, and code/problem backticks (\`...\`).
   - Clean spacing with zero unescaped artifacts.
`;

    // 1. If Groq requested and key available
    if (requestedModel === "groq" && groqKey) {
      try {
        const groqMessages = [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          })),
          { role: "user", content: userMessage },
        ];

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply, modelUsed: "groq" });
          }
        }
      } catch (groqErr) {
        console.warn("[Groq failed, falling back to Gemini]:", groqErr);
      }
    }

    // 2. If Gemini requested or Groq failed over
    if (geminiKey) {
      try {
        const contents = [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          ...conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ];

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply, modelUsed: "gemini" });
          }
        }
      } catch (geminiErr) {
        console.warn("[Gemini failed]:", geminiErr);
      }
    }

    // 3. Fallback to Groq if Gemini failed
    if (groqKey) {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return NextResponse.json({ reply, modelUsed: "groq" });
        }
      }
    }

    return NextResponse.json({
      reply:
        `${userName}, hitting the next rating tier requires strict problem-solving discipline. Focus on solving at least 1 contest-level problem and 1 LeetCode Medium without looking at editorial today. Keep pushing!`,
      modelUsed: "fallback",
    });
  } catch (error) {
    console.error("[Coach Chat API] Error:", error);
    return NextResponse.json({
      reply:
        "Maintain focus and keep your streak alive. Focus on binary search on answer and dynamic programming patterns today.",
      modelUsed: "fallback",
    });
  }
}
