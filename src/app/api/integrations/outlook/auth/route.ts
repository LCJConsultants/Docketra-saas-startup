import { NextResponse } from "next/server";
import { getOutlookAuthUrl } from "@/lib/outlook";

export async function GET() {
  const url = getOutlookAuthUrl();
  return NextResponse.redirect(url);
}
