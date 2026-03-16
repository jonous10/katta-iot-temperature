import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const db = await getConnection();
  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  await db.end();

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const user = rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Set session cookie with user ID and type
  const response = NextResponse.json({
    success: true,
    userType: user.type,
    userName: user.name
  });
  response.cookies.set("session", String(user.id), {
    httpOnly: true,
    path: "/",
  });
  response.cookies.set("userType", user.type, {
    path: "/",
  });

  return response;
}
