import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";
import { extractYoutubeId, youtubeWatchUrl } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 24), 50);
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ adventures: [], source: "unavailable" });
  }

  const { data, error } = await admin
    .from("immerse_adventures")
    .select(
      "id, title, story, youtube_url, youtube_id, site_id, site_name, state, created_at, is_public"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("adventures list", error);
    return NextResponse.json({ adventures: [], error: "Could not load adventures" });
  }

  return NextResponse.json({ adventures: data || [] });
}

export async function POST(request: Request) {
  let body: {
    title?: string;
    story?: string;
    youtubeUrl?: string;
    siteId?: string;
    siteName?: string;
    state?: string;
    isPublic?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = (body.title || "").trim().slice(0, 120);
  const story = (body.story || "").trim().slice(0, 2000);
  const youtubeId = extractYoutubeId(body.youtubeUrl || "");
  if (!title) {
    return NextResponse.json({ error: "Add a short title." }, { status: 400 });
  }
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Paste a valid YouTube link (youtube.com or youtu.be)." },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: "Accounts not configured." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Sign in to post an adventure." }, { status: 401 });
  }

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "Sign in to post an adventure." }, { status: 401 });
  }

  const { data, error } = await userClient
    .from("immerse_adventures")
    .insert({
      auth_user_id: user.id,
      title,
      story: story || null,
      youtube_url: youtubeWatchUrl(youtubeId),
      youtube_id: youtubeId,
      site_id: body.siteId || null,
      site_name: body.siteName || null,
      state: body.state || null,
      is_public: body.isPublic !== false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("adventure create", error);
    return NextResponse.json({ error: "Could not save adventure." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
