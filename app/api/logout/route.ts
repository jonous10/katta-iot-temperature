import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear session and userType cookies
  cookieStore.delete("session");
  cookieStore.delete("userType");

  return NextResponse.json({ ok: true });
}
