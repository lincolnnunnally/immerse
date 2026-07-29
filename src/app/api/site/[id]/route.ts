import { NextResponse } from "next/server";
import { resolveSite } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = await resolveSite(id);
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ site });
}
