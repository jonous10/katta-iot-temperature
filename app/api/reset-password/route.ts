import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { getConnection } from "@/lib/db";

type TokenRow = {
  user_id: number;
  expires_at: Date;
};

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const conn = await getConnection();

    // 1. Find the token and check if it's valid
    const [rows] = await conn.execute<TokenRow[] & mysql.RowDataPacket[]>(
      "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ? LIMIT 1",
      [token]
    );

    const tokenRecord = rows[0];

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // 2. Check if token has expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      // Delete expired token
      await conn.execute("DELETE FROM password_reset_tokens WHERE token = ?", [token]);
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update the user's password
    await conn.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hashedPassword, tokenRecord.user_id]
    );

    // 5. Delete the used token (and any other tokens for this user)
    await conn.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [tokenRecord.user_id]
    );

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
