import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "OCR processing not yet implemented" }, { status: 501 });
}
