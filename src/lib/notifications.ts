/**
 * RankStack Notification Service
 * ─────────────────────────────
 * Email  → Maileroo Sending API (REST, no domain verification needed)
 * WhatsApp → CallMeBot free API (optional)
 * Server-only — do NOT import in client components.
 */

// ─── Types ──────────────────────────────────────────────────────────

export type NotificationResult = {
  email: { ok: boolean; error?: string };
  whatsapp: { ok: boolean; error?: string };
};

// ─── Core Senders ──────────────────────────────────────────────────────────

export async function sendEmail(
  subject: string,
  html: string,
  toEmail?: string,
  plainText?: string
): Promise<{ ok: boolean; error?: string }> {
  const sendingKey = process.env.MAILEROO_SENDING_KEY ||
    "14ef2138d168a234c47d38330355536547bd0c7994c8f3b3a2661e09d3980175";
  const fromEmail = process.env.MAILEROO_FROM_EMAIL ||
    "bot@codereminder.maileroo.app";
  const to = toEmail || process.env.NOTIFY_TO_EMAIL;
  if (!to) return { ok: false, error: "No recipient email address provided" };

  // Fallback plain text if not explicitly provided
  const fallbackPlain = plainText || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  try {
    const form = new FormData();
    form.append("from", `RankStack Updates <${fromEmail}>`);
    form.append("to", to);
    form.append("subject", subject);
    form.append("html", html);
    form.append("plain", fallbackPlain);

    const res = await fetch("https://smtp.maileroo.com/send", {
      method: "POST",
      headers: { "X-API-Key": sendingKey },
      body: form,
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("[Notify] Maileroo API error:", res.status, text);
      return { ok: false, error: `Maileroo ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Notify] Email failed:", msg);
    return { ok: false, error: msg };
  }
}


export async function sendWhatsApp(
  message: string,
  targetPhone?: string
): Promise<{ ok: boolean; error?: string }> {
  const phone = targetPhone || process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apiKey)
    return { ok: false, error: "WhatsApp not configured" };

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res = await fetch(url);
    return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Notify] WhatsApp failed:", msg);
    return { ok: false, error: msg };
  }
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function template(title: string, body: string, ctaLabel?: string, ctaUrl?: string, userName?: string): string {
  const cta = ctaLabel && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#FF4D00;color:#000000;font-weight:700;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;border-radius:4px;text-transform:uppercase">${ctaLabel} →</a>`
    : "";

  const userTag = userName ? userName : "Developer";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;color:#e6e6e6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:30px 10px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #2a2a2a;border-radius:8px;max-width:580px;width:100%;overflow:hidden">
<tr><td style="background:#FF4D00;padding:16px 24px">
  <span style="font-size:18px;font-weight:900;color:#000000;letter-spacing:1px">RANKSTACK</span>
  <span style="float:right;font-size:12px;color:#000000;font-weight:600;margin-top:4px">${userTag}</span>
</td></tr>
<tr><td style="padding:28px 24px;color:#d4d4d4;font-size:14px">
  <h2 style="color:#ffffff;font-size:18px;margin:0 0 16px;font-weight:700">${title}</h2>
  ${body}
  ${cta}
</td></tr>
<tr><td style="border-top:1px solid #262626;padding:16px 24px;font-size:11px;color:#737373;line-height:1.5">
  You received this transactional alert because you enabled streak tracking on RankStack.<br>
  Manage your preferences in your <a href="http://localhost:3000/dashboard#settings" style="color:#FF4D00;text-decoration:none">Dashboard Settings</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── High-Level Helpers ───────────────────────────────────────────────────────

export async function sendDailyReminder(stats: {
  streak: number;
  todaySolved: boolean;
  totalSolved: number;
  toEmail?: string;
  phone?: string;
  userName?: string;
}): Promise<NotificationResult> {
  const { streak, todaySolved, totalSolved, toEmail, phone, userName } = stats;
  const displayName = userName || "Coder";
  const status = todaySolved
    ? "Great job! You have already solved today and your streak is safe."
    : "You have not solved any problems yet today. Take 20 minutes to keep your streak alive.";

  const subject = todaySolved
    ? `[RankStack] Day ${streak} Streak Maintained - Nice work, ${displayName}`
    : `[RankStack] Daily Streak Reminder (${streak} Days Active)`;

  const body = `<p style="margin:0 0 16px">${status}</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #2a2a2a">
  <tr><td style="padding:10px 14px;background:#1f1f1f;border:1px solid #2a2a2a;color:#a3a3a3;font-size:12px">Current Streak</td>
      <td style="padding:10px 14px;background:#1f1f1f;border:1px solid #2a2a2a;color:#FF4D00;font-size:16px;font-weight:700">${streak} Days</td></tr>
  <tr><td style="padding:10px 14px;background:#1f1f1f;border:1px solid #2a2a2a;color:#a3a3a3;font-size:12px">Total Problems Solved</td>
      <td style="padding:10px 14px;background:#1f1f1f;border:1px solid #2a2a2a;color:#ffffff;font-size:16px;font-weight:700">${totalSolved}</td></tr>
</table>
<p style="color:#a3a3a3;font-size:12px;margin-top:16px">RankStack 6-hour checkpoint update.</p>`;

  const plainText = `RankStack Daily Reminder\n${status}\n\nCurrent Streak: ${streak} Days\nTotal Solved: ${totalSolved}\n\nContinue practicing: https://leetcode.com/problemset/`;

  const waMsg = `⚡ RankStack Check-in (${displayName})\n${status}\nStreak: ${streak}D | Solved: ${totalSolved}\nDashboard: http://localhost:3000/dashboard`;

  const [email, whatsapp] = await Promise.all([
    sendEmail(subject, template(subject, body, "Open Practice Set", "https://leetcode.com/problemset/", userName), toEmail, plainText),
    sendWhatsApp(waMsg, phone),
  ]);
  return { email, whatsapp };
}

export async function sendContestAlert(
  contest: {
    name: string;
    platform: string;
    startTime: string;
    url: string;
    durationSeconds: number;
  },
  recipient?: {
    email?: string;
    phone?: string;
    userName?: string;
  }
): Promise<NotificationResult> {
  const start = new Date(contest.startTime);
  const timeIST = start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const dateIST = start.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
  const durationH = (contest.durationSeconds / 3600).toFixed(1);

  const subject = `[RankStack] Starting in 1 Hour: ${contest.name} (${contest.platform.toUpperCase()})`;
  const body = `<p style="margin:0 0 16px">The contest is starting in <strong>1 hour</strong>. Make sure your environment is ready.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #2a2a2a">
  <tr><td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#a3a3a3;font-size:12px">Platform</td>
      <td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#ffffff;font-weight:600;text-transform:uppercase">${contest.platform}</td></tr>
  <tr><td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#a3a3a3;font-size:12px">Contest Name</td>
      <td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#FF4D00;font-weight:700">${contest.name}</td></tr>
  <tr><td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#a3a3a3;font-size:12px">Start Time</td>
      <td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#ffffff">${dateIST} at ${timeIST} IST</td></tr>
  <tr><td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#a3a3a3;font-size:12px">Duration</td>
      <td style="padding:8px 12px;border:1px solid #2a2a2a;background:#1f1f1f;color:#ffffff">${durationH} hours</td></tr>
</table>
<p style="color:#a3a3a3;font-size:12px;margin-top:16px">Tip: Warm up with 1 or 2 fast ad-hoc problems before the contest begins.</p>`;

  const plainText = `RankStack Contest Alert: ${contest.name}\nPlatform: ${contest.platform.toUpperCase()}\nStart Time: ${dateIST} at ${timeIST} IST\nDuration: ${durationH} hours\n\nRegister / Join Contest: ${contest.url}`;

  const waMsg = `🚨 RankStack Contest Alert!\n1 hour to: ${contest.name}\nPlatform: ${contest.platform.toUpperCase()}\nTime: ${timeIST} IST | Duration: ${durationH}h\nRegister: ${contest.url}`;

  const [email, whatsapp] = await Promise.all([
    sendEmail(subject, template(subject, body, "View Contest Details", contest.url, recipient?.userName), recipient?.email, plainText),
    sendWhatsApp(waMsg, recipient?.phone),
  ]);
  return { email, whatsapp };
}

export async function sendStreakBreakAlert(
  currentStreak: number,
  recipient?: {
    email?: string;
    phone?: string;
    userName?: string;
  }
): Promise<NotificationResult> {
  const subject = `[RankStack] Streak Alert: ${currentStreak}-Day Streak at Risk`;
  const body = `<p style="font-size:16px;color:#FF4D00;font-weight:600;margin:0 0 12px">Your daily streak has not been updated today.</p>
<p>Solve at least 1 problem before midnight to maintain your <strong>${currentStreak}-day momentum</strong>.</p>
<ul style="color:#a3a3a3;line-height:1.8;padding-left:20px">
  <li><a href="https://leetcode.com/problemset/?difficulty=EASY" style="color:#FF4D00">LeetCode Problemset</a></li>
  <li><a href="https://www.codechef.com/practice" style="color:#FF4D00">CodeChef Practice</a></li>
  <li><a href="https://practice.geeksforgeeks.org/explore?page=1" style="color:#FF4D00">GeeksforGeeks Practice</a></li>
</ul>
<p style="color:#737373;font-size:12px">Consistent daily practice is the fastest path to rating improvement.</p>`;

  const plainText = `RankStack Streak Alert\nYour ${currentStreak}-day streak is at risk of breaking tonight!\n\nSolve a problem now: https://leetcode.com/problemset/?difficulty=EASY`;

  const waMsg = `🔴 STREAK ALERT!\nYour ${currentStreak}-day streak breaks at midnight!\nSolve something NOW:\nhttps://leetcode.com/problemset/?difficulty=EASY`;

  const [email, whatsapp] = await Promise.all([
    sendEmail(subject, template(subject, body, "Solve A Problem Now", "https://leetcode.com/problemset/?difficulty=EASY", recipient?.userName), recipient?.email, plainText),
    sendWhatsApp(waMsg, recipient?.phone),
  ]);
  return { email, whatsapp };
}
