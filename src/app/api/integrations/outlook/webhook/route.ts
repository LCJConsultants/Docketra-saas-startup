import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Outlook webhook not yet implemented" }, { status: 501 });
}
