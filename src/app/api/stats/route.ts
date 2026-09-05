import { NextRequest, NextResponse } from "next/server";
import { fetchAggregatedStats } from "@/lib/connectors";
import { UserHandles } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customHandles: Partial<UserHandles> = {};

    const cf = searchParams.get("cf") || searchParams.get("codeforces");
    if (cf) customHandles.codeforces = cf;

    const lc = searchParams.get("lc") || searchParams.get("leetcode");
    if (lc) customHandles.leetcode = lc;

    const cc = searchParams.get("cc") || searchParams.get("codechef");
    if (cc) customHandles.codechef = cc.split(",").map((s) => s.trim()).filter(Boolean);

    const gfg = searchParams.get("gfg");
    if (gfg) customHandles.gfg = gfg;

    const aggregated = await fetchAggregatedStats(customHandles);

    return NextResponse.json(aggregated, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[API /api/stats] Internal error:", error);
    return NextResponse.json(
      { error: "Failed to aggregate platform metrics" },
      { status: 500 }
    );
  }
}
