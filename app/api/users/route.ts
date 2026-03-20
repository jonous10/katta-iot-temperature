import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";
import mysql from "mysql2/promise";

type UserRow = {
  id: number;
  email: string;
  name: string;
  type: string;
  created_at?: string;
};

// Helper to get current user from session
async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  const userTypeCookie = cookieStore.get("userType");
  
  if (!sessionCookie) {
    return null;
  }
  
  return {
    id: parseInt(sessionCookie.value),
    type: userTypeCookie?.value || "pending"
  };
}

// GET - Fetch all users (admin/owner only)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Only admin and owner can view users
    if (!["admin", "owner"].includes(currentUser.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const conn = await getConnection();
    const [rows] = await conn.execute<UserRow[] & mysql.RowDataPacket[]>(
      "SELECT id, name, email, type, created_at FROM users ORDER BY created_at DESC"
    );
    await conn.end();
    
    return NextResponse.json({ users: rows, currentUserId: currentUser.id });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Update user type (admin/owner only)
export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Only admin and owner can manage users
    if (!["admin", "owner"].includes(currentUser.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const { userId, newType } = await req.json();
    
    // Validate the new type
    const validTypes = ["pending", "viewer", "admin", "owner"];
    if (!validTypes.includes(newType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }
    
    // Get the target user's current type
    const conn = await getConnection();
    const [targetRows] = await conn.execute<UserRow[] & mysql.RowDataPacket[]>(
      "SELECT id, type FROM users WHERE id = ?",
      [userId]
    );
    
    if (targetRows.length === 0) {
      await conn.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const targetUser = targetRows[0];
    
    // Permission checks:
    // - Can't change your own type
    if (targetUser.id === currentUser.id) {
      await conn.end();
      return NextResponse.json({ error: "Cannot change your own type" }, { status: 403 });
    }
    
    // - Admins can manage pending, viewer, and promote to admin
    // - Only owners can manage other admins, or set someone as owner
    if (currentUser.type === "admin") {
      // Admin cannot change other admins or owner users
      if (["admin", "owner"].includes(targetUser.type)) {
        await conn.end();
        return NextResponse.json({ error: "Admins cannot manage other admins or owners" }, { status: 403 });
      }
      // Admin cannot set someone as owner
      if (newType === "owner") {
        await conn.end();
        return NextResponse.json({ error: "Only owners can grant owner privileges" }, { status: 403 });
      }
    }
    
    // Owner can't be changed by anyone except themselves (but we already blocked self-change)
    if (targetUser.type === "owner" && currentUser.type !== "owner") {
      await conn.end();
      return NextResponse.json({ error: "Cannot change owner type" }, { status: 403 });
    }
    
    // Perform the update
    await conn.execute(
      "UPDATE users SET type = ? WHERE id = ?",
      [newType, userId]
    );
    await conn.end();
    
    return NextResponse.json({ success: true, message: `User type updated to ${newType}` });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete a user (admin/owner only)
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Only admin and owner can delete users
    if (!["admin", "owner"].includes(currentUser.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const { userId } = await req.json();
    
    const conn = await getConnection();
    
    // Get the target user
    const [targetRows] = await conn.execute<UserRow[] & mysql.RowDataPacket[]>(
      "SELECT id, type FROM users WHERE id = ?",
      [userId]
    );
    
    if (targetRows.length === 0) {
      await conn.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const targetUser = targetRows[0];
    
    // Can't delete yourself
    if (targetUser.id === currentUser.id) {
      await conn.end();
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 403 });
    }
    
    // Admins can only delete pending and viewer users
    if (currentUser.type === "admin" && ["admin", "owner"].includes(targetUser.type)) {
      await conn.end();
      return NextResponse.json({ error: "Admins cannot delete other admins or owners" }, { status: 403 });
    }
    
    // Owners can't be deleted
    if (targetUser.type === "owner") {
      await conn.end();
      return NextResponse.json({ error: "Cannot delete owner account" }, { status: 403 });
    }
    
    await conn.execute("DELETE FROM users WHERE id = ?", [userId]);
    await conn.end();
    
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
