import { NextResponse } from "next/server";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { getConnection } from "@/lib/db";
import nodemailer from "nodemailer";

type UserRow = {
  id: number;
};

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // isaksgronneverden@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // Your 16-character app password
  },
});

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

    // 4. Send email with Gmail
    await transporter.sendMail({
      from: `"Katta IoT" <${process.env.GMAIL_USER}>`,
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
