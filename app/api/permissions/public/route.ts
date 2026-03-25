import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";

// Hardcoded fallback used if DB is empty
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
    VIEW_TEMPERATURE: ["owner", "admin", "viewer"],
    VIEW_TEMPERATURE_HISTORY: ["owner", "admin"],
    EXPORT_DATA: ["owner", "admin"],
    DELETE_DATA: ["owner"],
    VIEW_USERS: ["owner", "admin"],
    MANAGE_USERS: ["owner", "admin"],
    MANAGE_PERMISSIONS: ["owner"],
    MANAGE_ADMINS: ["owner"],
    VIEW_SYSTEM_STATUS: ["owner", "admin"],
    MANAGE_SYSTEM: ["owner"],
};

// GET — any authenticated user can fetch the permission map (they need it to render UI)
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const conn = await getConnection();

        // Make sure the table exists
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        permission_key VARCHAR(100) PRIMARY KEY,
        allowed_roles  JSON NOT NULL
      )
    `);

        const [rows]: any = await conn.execute(
            "SELECT permission_key, allowed_roles FROM permissions"
        );
        await conn.end();

        if (rows.length === 0) {
            return NextResponse.json({ permissions: DEFAULT_PERMISSIONS });
        }

        const permissions: Record<string, string[]> = {};
        for (const row of rows) {
            permissions[row.permission_key] =
                typeof row.allowed_roles === "string"
                    ? JSON.parse(row.allowed_roles)
                    : row.allowed_roles;
        }

        // Fill in any new permissions not yet in DB
        for (const [key, val] of Object.entries(DEFAULT_PERMISSIONS)) {
            if (!(key in permissions)) permissions[key] = val;
        }

        return NextResponse.json({ permissions });
    } catch (err) {
        console.error("GET PUBLIC PERMISSIONS ERROR:", err);
        // On DB error, fall back to defaults so the UI still works
        return NextResponse.json({ permissions: DEFAULT_PERMISSIONS });
    }
}