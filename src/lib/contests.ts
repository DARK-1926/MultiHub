import { ContestItem } from "./types";

export async function fetchUpcomingContests(): Promise<ContestItem[]> {
  const contests: ContestItem[] = [];
  const now = new Date();

  // 1. Fetch live CodeChef upcoming contests from official API
  try {
    const ccRes = await fetch(
      "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 1800 }, // 30 mins cache
      }
    );

    if (ccRes.ok) {
      const ccData = await ccRes.json();
      const futureContests = ccData.future_contests || [];

      for (const c of futureContests.slice(0, 4)) {
        const durationSec = parseInt(c.contest_duration, 10) * 60;
        contests.push({
          id: `cc-${c.contest_code || c.contest_id}`,
          name: c.contest_name || `CodeChef ${c.contest_code}`,
          platform: "codechef",
          startTime: c.contest_start_date_iso || new Date(c.contest_start_date).toISOString(),
          durationSeconds: durationSec > 0 ? durationSec : 7200,
          url: `https://www.codechef.com/${c.contest_code}`,
        });
      }
    }
  } catch (err) {
    console.warn("[Contests] CodeChef live API fetch failed, using schedule:", err);
    // Fallback CodeChef starters
    const nextWed = new Date(now);
    const daysUntilWed = (3 - nextWed.getDay() + 7) % 7 || 7;
    nextWed.setDate(nextWed.getDate() + daysUntilWed);
    nextWed.setUTCHours(14, 30, 0, 0);

    contests.push({
      id: "cc-starters-255",
      name: "Starters 255 (Rated for Div 2, 3 & 4)",
      platform: "codechef",
      startTime: nextWed.toISOString(),
      durationSeconds: 120 * 60,
      url: "https://www.codechef.com/START255",
    });
  }

  // 2. Fetch live Codeforces upcoming contests
  try {
    const cfRes = await fetch("https://codeforces.com/api/contest.list?gym=false", {
      next: { revalidate: 3600 },
    });
    if (cfRes.ok) {
      const cfData = await cfRes.json();
      if (cfData.status === "OK" && Array.isArray(cfData.result)) {
        const upcomingCf = cfData.result
          .filter((c: any) => c.phase === "BEFORE")
          .sort((a: any, b: any) => a.startTimeSeconds - b.startTimeSeconds)
          .slice(0, 3);

        for (const c of upcomingCf) {
          contests.push({
            id: `cf-${c.id}`,
            name: c.name,
            platform: "codeforces",
            startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
            durationSeconds: c.durationSeconds,
            url: `https://codeforces.com/contests/${c.id}`,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Contests] Codeforces fetch failed:", err);
  }

  // 3. Compute upcoming LeetCode Contests
  // Weekly: Every Sunday at 08:00 IST (02:30 UTC)
  const nextSunday = new Date(now);
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setUTCHours(2, 30, 0, 0);

  contests.push({
    id: "lc-weekly",
    name: "LeetCode Weekly Contest 440",
    platform: "leetcode",
    startTime: nextSunday.toISOString(),
    durationSeconds: 90 * 60,
    url: "https://leetcode.com/contest/",
  });

  // Biweekly: Every alternate Saturday at 20:00 IST (14:30 UTC)
  const nextSaturday = new Date(now);
  const daysUntilSat = (6 - nextSaturday.getDay() + 7) % 7 || 7;
  nextSaturday.setDate(nextSaturday.getDate() + daysUntilSat);
  nextSaturday.setUTCHours(14, 30, 0, 0);

  contests.push({
    id: "lc-biweekly",
    name: "LeetCode Biweekly Contest 152",
    platform: "leetcode",
    startTime: nextSaturday.toISOString(),
    durationSeconds: 90 * 60,
    url: "https://leetcode.com/contest/",
  });

  // 4. Compute upcoming GeeksforGeeks Weekly Contest (Every Sunday at 19:00 IST / 13:30 UTC)
  const nextGfgSun = new Date(now);
  const gfgDays = (7 - nextGfgSun.getDay()) % 7 || 7;
  nextGfgSun.setDate(nextGfgSun.getDate() + gfgDays);
  nextGfgSun.setUTCHours(13, 30, 0, 0);

  contests.push({
    id: "gfg-weekly",
    name: "GeeksforGeeks Weekly Contest 198",
    platform: "gfg",
    startTime: nextGfgSun.toISOString(),
    durationSeconds: 90 * 60,
    url: "https://practice.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest",
  });

  // Sort all contests chronologically
  return contests.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}
