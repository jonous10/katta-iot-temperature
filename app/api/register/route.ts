import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const password_hash = await bcrypt.hash(password, 10);

  const db = await getConnection();
  await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, password_hash]
  );
  await db.end();

  return NextResponse.json({ success: true });
}
