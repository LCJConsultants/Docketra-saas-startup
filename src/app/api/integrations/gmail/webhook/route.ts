import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Handle incoming Gmail webhook notifications
  return NextResponse.json({ message: "Gmail webhook endpoint ready" });
}
