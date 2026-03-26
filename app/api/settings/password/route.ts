import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";

type UserRow = {
  id: number;
  password_hash: string;
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Session cookie contains the user ID directly
    const userId = sessionCookie.value;

    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const conn = await getConnection();

    // Get user's current password hash
    const [rows] = await conn.execute<UserRow[] & mysql.RowDataPacket[]>(
      "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const user = rows[0];

    if (!user) {
      await conn.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      await conn.end();
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, 10);

    await conn.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newHash, userId]
    );

    await conn.end();

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
