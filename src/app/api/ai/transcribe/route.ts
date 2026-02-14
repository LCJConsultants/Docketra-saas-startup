import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Voice transcription not yet implemented" }, { status: 501 });
}
