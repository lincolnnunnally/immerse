import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    siteId?: string;
    siteName?: string;
    arrival?: string;
    nights?: number;
    guests?: number;
    email?: string;
    agreedRules?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const siteId = (body.siteId || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  if (!siteId) {
    return NextResponse.json({ error: "Missing site." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Interest signup is not configured yet." },
      { status: 503 }
    );
  }

  let authUserId: string | null = null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authHeader = request.headers.get("authorization");
  if (url && anon && authHeader?.startsWith("Bearer ")) {
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data } = await userClient.auth.getUser();
    authUserId = data.user?.id ?? null;
  }

  const { data, error } = await admin
    .from("immerse_stay_requests")
    .insert({
      site_id: siteId,
      site_name: body.siteName || null,
      arrival: body.arrival || null,
      nights: body.nights ?? null,
      guests: body.guests ?? null,
      email,
      auth_user_id: authUserId,
      agreed_rules: body.agreedRules || [],
      status: "interest",
    })
    .select("id")
    .single();

  if (error) {
    console.error("stay-request", error);
    return NextResponse.json(
      { error: "Could not save your interest." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
