import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Dropbox sync endpoint ready" });
}
