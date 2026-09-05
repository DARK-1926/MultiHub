import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUserHandles } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    lc_handle: user.lc_handle || "",
    cc_handles: (user.cc_handles || []).join(", "),
    gfg_handle: user.gfg_handle || "",
    cf_handle: user.cf_handle || "",
    github_handle: user.github_handle || "",
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lc_handle, cc_handles, gfg_handle, cf_handle, github_handle } = body;

    const parsedCcHandles = typeof cc_handles === "string"
      ? cc_handles.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(cc_handles)
      ? cc_handles
      : [];

    await updateUserHandles(user.id, {
      lc_handle: lc_handle?.trim() || null,
      cc_handles: parsedCcHandles,
      gfg_handle: gfg_handle?.trim() || null,
      cf_handle: cf_handle?.trim() || null,
      github_handle: github_handle?.trim() || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/user/settings]", msg);
    return NextResponse.json({ error: "Failed to update profile settings" }, { status: 500 });
  }
}
