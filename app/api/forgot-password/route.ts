import { NextResponse } from "next/server";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { getConnection } from "@/lib/db";
import { Resend } from "resend";

type UserRow = {
  id: number;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const conn = await getConnection();

    // 1. Check if user exists
    const [rows] = await conn.execute<UserRow[] & mysql.RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];

    // Always return ok to avoid email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // 2. Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    // 3. Store token
    await conn.execute(
      "INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
      [token, user.id, expiresAt]
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    // 4. Send email with Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // IMPORTANT
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to choose a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
