import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const userTypeCookie = cookieStore.get("userType");

    if (!sessionCookie) return null;

    return {
        id: parseInt(sessionCookie.value),
        type: userTypeCookie?.value || "pending",
    };
}

// DELETE - Remove a sensor reading by timestamp
export async function DELETE(req: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        if (!["admin", "owner"].includes(currentUser.type)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { ts } = await req.json();

        if (!ts) {
            return NextResponse.json({ error: "Timestamp required" }, { status: 400 });
        }

        const conn = await getConnection();
        await conn.execute("DELETE FROM sensor_data WHERE ts = ?", [ts]);
        await conn.end();

        return NextResponse.json({ success: true, message: "Record deleted" });
    } catch (err) {
        console.error("DELETE SENSOR DATA ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}