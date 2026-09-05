import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

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
    const userName = user?.name || "Coder";

    const body = await req.json();
    const userMessage = body.message || "What should I focus on right now?";
    const conversationHistory = body.history || [];
    const requestedModel = (body.model || "groq").toLowerCase(); // "groq" | "gemini"

    const now = new Date();
    // Exact countdown to CodeChef Starters 255 (Wed Sep 9, 2026, 8:00 PM IST)
    const starters255 = new Date("2026-09-09T20:00:00+05:30");
    const diffMs = starters255.getTime() - now.getTime();
    const daysUntilStarters = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const hoursUntilStarters = Math.max(0, Math.floor((diffMs / (1000 * 60 * 60)) % 24));
    const countdownStr = `${daysUntilStarters} days and ${hoursUntilStarters} hours`;

    const systemPrompt = `
You are RankStack AI Coach — a strict, encouraging, high-velocity Competitive Programming guide and mentor for ${userName}.

CURRENT DATE & CONTEST TIMELINE (ACCURACY IS MANDATORY):
- Current Date: ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}.
- Upcoming Contest: CodeChef Starters 255 is on Wednesday, Sep 9, 2026 at 08:00 PM IST.
- TIME REMAINING UNTIL STARTERS 255: EXACTLY ${countdownStr} (Starts in ~${daysUntilStarters}D ${hoursUntilStarters}H).
  CRITICAL RULE: NEVER hallucinate 23 days! Starters 255 is strictly ${daysUntilStarters} days away (starts in ${daysUntilStarters}D ${hoursUntilStarters}H).
- LeetCode Weekly Contest 440: Sunday, Sep 6, 2026.

${userName.toUpperCase()}'S LIVE TELEMETRY:
- CodeChef: Tracked handles: ${user?.cc_handles?.length ? user.cc_handles.join(", ") : "Main & College accounts"}.
  Target: Reach 3★ (1600+ rating) in upcoming Starters 255 (in ${daysUntilStarters} days)!
- LeetCode Handle: ${user?.lc_handle || "Connected"}
  Goal: Shift ratio from Medium to Hard and reduce solve time.
- GeeksforGeeks Handle: ${user?.gfg_handle || "Connected"}
- GitHub Handle: ${user?.github_handle || "Connected"}

YOUR MISSION AS COACH:
1. KEEP THE USER ON CHECK: Hold ${userName} accountable. Ask if they solved daily problems or skipped. No excuses.
2. GUIDE IN THE RIGHT DIRECTION: For CodeChef rating jumps, problems A & B must be solved fast. Problem C (usually binary search on answer, greedy, or 1D DP) decides the rating jump.
3. FORMATTING IS CRITICAL:
   - Use Markdown cleanly with bold keywords (**term**), bullet points (* or -), and numbered lists (1., 2.).
   - Never output unescaped raw control characters.
   - Separate points with clean linebreaks so the response renders beautifully.
4. Keep the tone sharp, competitive, and respectful. When referencing Starters 255, remember it is in ${daysUntilStarters} days!
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
