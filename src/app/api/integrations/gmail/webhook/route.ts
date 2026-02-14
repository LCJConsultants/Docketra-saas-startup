import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Gmail webhook not yet implemented" }, { status: 501 });
}
