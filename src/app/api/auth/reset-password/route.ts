import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Password reset without relying on per-app SMTP.
 * Verifies the account exists, then sets a new password via service role
 * only when the requester also proves control of the old password OR we
 * use a recovery code flow.
 *
 * For locked-out users: generate a one-time recovery via admin and email
 * if Supabase SMTP is configured; otherwise allow signed-in change.
 *
 * This endpoint supports:
 * 1) { mode: "change", email, currentPassword, newPassword } — signed-in style
 * 2) { mode: "request", email } — tries Supabase recovery email
 * 3) { mode: "set", accessToken, newPassword } — after recovery link session
 */

export async function POST(request: Request) {
  let body: {
    mode?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    accessToken?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const mode = body.mode || "request";
  const email = (body.email || "").trim().toLowerCase();
  const newPassword = body.newPassword || "";

  if (mode === "request") {
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json({ error: "Auth not configured." }, { status: 503 });
    }

    const site =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://immerse.unitedundergod.org");

    // Prefer generateLink + (optional) future Resend; also try resetPasswordForEmail
    const admin = createAdminClient();
    if (admin) {
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${site.replace(/\/$/, "")}/account?mode=recovery`,
        },
      });
      if (error) {
        // Don't reveal whether email exists
        console.error("recovery generate", error.message);
      } else if (data?.properties?.action_link) {
        // If project SMTP is on, also trigger built-in email as belt-and-suspenders
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const sb = createClient(url, anon);
          await sb.auth.resetPasswordForEmail(email, {
            redirectTo: `${site.replace(/\/$/, "")}/account?mode=recovery`,
          });
        } catch {
          /* ignore */
        }
        // Without outbound mailer, surface the recovery link only in non-production logs
        if (process.env.NODE_ENV !== "production") {
          console.info("recovery_link", data.properties.action_link);
        }
      }
    }

    // Always same message (no account enumeration)
    return NextResponse.json({
      ok: true,
      message:
        "If that email has an account, a recovery email was requested. Check your inbox (and spam). If mail is not set up on the shared project, sign in if you still know your password, or contact support via the footer email.",
    });
  }

  if (mode === "change") {
    if (!email.includes("@") || !body.currentPassword) {
      return NextResponse.json({ error: "Email and current password required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json({ error: "Auth not configured." }, { status: 503 });
    }
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, anon);
    const { data: signed, error: signErr } = await sb.auth.signInWithPassword({
      email,
      password: body.currentPassword,
    });
    if (signErr || !signed.user) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }
    const { error: upErr } = await sb.auth.updateUser({ password: newPassword });
    if (upErr) {
      return NextResponse.json({ error: "Could not update password." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: "Password updated." });
  }

  if (mode === "set") {
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = body.accessToken;
    if (!url || !anon || !token) {
      return NextResponse.json({ error: "Missing recovery session." }, { status: 400 });
    }
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) {
      return NextResponse.json(
        { error: "Could not set password. Open the recovery link again." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, message: "Password set. You can sign in." });
  }

  return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
}
