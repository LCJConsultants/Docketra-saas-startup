import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Dropbox sync not yet implemented" }, { status: 501 });
}
