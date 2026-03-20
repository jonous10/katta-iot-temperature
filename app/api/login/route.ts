import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { getConnection } from "@/lib/db";

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  type: string;
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const conn = await getConnection();

    const [rows] = await conn.execute<UserRow[] & mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      userType: user.type,
      userName: user.name,
    });

    response.cookies.set("session", String(user.id), {
      httpOnly: true,
      path: "/",
    });

    response.cookies.set("userType", user.type, {
      path: "/",
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
