import { NextResponse } from "next/server";
import { Recommendation } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json({ error: "No AI key configured" }, { status: 500 });
  }

  const user = await getCurrentUser().catch(() => null);
  const userName = user?.name || "Student";

  const prompt = `
You are a competitive programming coach for ${userName}.
Connected profile context:
- LeetCode: ${user?.lc_handle || "Active"}
- CodeChef: ${user?.cc_handles?.join(", ") || "Active"}
- GeeksforGeeks: ${user?.gfg_handle || "Active"}

Recommend 4 specific, real CP problems to help level up to 1600+ on CodeChef and master Medium/Hard LeetCode/GfG.
Focus on:
1. Dynamic Programming / 0-1 Knapsack
2. Tree & Graph Traversals (BFS/DFS)
3. Sliding Window / Two Pointers
4. Binary Search on Answer

Return strictly a JSON array of 4 objects with no markdown fences, matching:
[
  {
    "id": "rec-1",
    "title": "Problem Name",
    "platform": "leetcode" | "codechef" | "gfg",
    "difficulty": "Medium" | "1400-1600" | "Hard",
    "url": "https://...",
    "reason": "One concise line why this helps level up."
  }
]
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const recommendations: Recommendation[] = JSON.parse(cleanJson);

    return NextResponse.json({ recommendations, source: "gemini-2.5-flash" });
  } catch (error) {
    console.error("[AI Recommendations] Error:", error);
    // Return curated fallback tailored to user profile
    const fallback: Recommendation[] = [
      {
        id: "rec-1",
        title: "416. Partition Equal Subset Sum",
        platform: "leetcode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/partition-equal-subset-sum/",
        reason: "Core 0/1 knapsack DP pattern to solidify your Medium solve foundation.",
      },
      {
        id: "rec-2",
        title: "SUBINC - Count Subarrays",
        platform: "codechef",
        difficulty: "1400-1550",
        url: "https://www.codechef.com/problems/SUBINC",
        reason: "Linear DP on subarrays to push rating towards 3-star territory.",
      },
      {
        id: "rec-3",
        title: "Detect Cycle in an Undirected Graph",
        platform: "gfg",
        difficulty: "Medium",
        url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
        reason: "Reinforce BFS/DFS coloring transitions for campus coding rounds.",
      },
      {
        id: "rec-4",
        title: "207. Course Schedule",
        platform: "leetcode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/course-schedule/",
        reason: "Topological sorting via Kahn's algorithm; frequently tested pattern.",
      },
    ];
    return NextResponse.json({ recommendations: fallback, source: "fallback" });
  }
}
