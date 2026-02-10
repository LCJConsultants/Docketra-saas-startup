import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Implement OCR processing with tesseract.js
  return NextResponse.json({ message: "OCR endpoint ready" });
}
