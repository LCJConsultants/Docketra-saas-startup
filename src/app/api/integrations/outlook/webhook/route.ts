import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Handle incoming Outlook/Microsoft Graph webhook notifications
  return NextResponse.json({ message: "Outlook webhook endpoint ready" });
}
