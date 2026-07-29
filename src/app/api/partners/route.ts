import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    orgName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    parkSystem?: string;
    message?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orgName = (body.orgName || "").trim().slice(0, 160);
  const email = (body.email || "").trim().toLowerCase();
  if (!orgName) {
    return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Partner form is not configured." }, { status: 503 });
  }

  const { error } = await admin.from("immerse_park_partners").insert({
    org_name: orgName,
    contact_name: (body.contactName || "").trim().slice(0, 120) || null,
    email,
    phone: (body.phone || "").trim().slice(0, 40) || null,
    park_system: (body.parkSystem || "").trim().slice(0, 120) || null,
    message: (body.message || "").trim().slice(0, 3000) || null,
    status: "new",
  });

  if (error) {
    console.error("partners", error);
    return NextResponse.json({ error: "Could not save your interest." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
