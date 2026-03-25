import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { cookies } from "next/headers";

// The hardcoded fallback — used if DB has no rows yet (first run)
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

async function getOwnerUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const userTypeCookie = cookieStore.get("userType");

    if (!sessionCookie) return null;

    return {
        id: parseInt(sessionCookie.value),
        type: userTypeCookie?.value || "pending",
    };
}

// GET — load all permissions from DB (falls back to defaults on first run)
export async function GET() {
    try {
        const currentUser = await getOwnerUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (currentUser.type !== "owner") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const conn = await getConnection();

        // Ensure table exists
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
            // First time — return defaults (they'll be seeded on first save)
            return NextResponse.json({ permissions: DEFAULT_PERMISSIONS });
        }

        const permissions: Record<string, string[]> = {};
        for (const row of rows) {
            permissions[row.permission_key] =
                typeof row.allowed_roles === "string"
                    ? JSON.parse(row.allowed_roles)
                    : row.allowed_roles;
        }

        // Fill in any missing keys with defaults (safe for new permissions added later)
        for (const [key, val] of Object.entries(DEFAULT_PERMISSIONS)) {
            if (!(key in permissions)) permissions[key] = val;
        }

        return NextResponse.json({ permissions });
    } catch (err) {
        console.error("GET PERMISSIONS ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT — save full permission map to DB
export async function PUT(req: Request) {
    try {
        const currentUser = await getOwnerUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        if (currentUser.type !== "owner") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { permissions } = await req.json() as { permissions: Record<string, string[]> };

        if (!permissions || typeof permissions !== "object") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Safety: owner can never lose these
        const OWNER_LOCKED = ["MANAGE_PERMISSIONS", "MANAGE_ADMINS", "MANAGE_SYSTEM", "DELETE_DATA"];
        for (const key of OWNER_LOCKED) {
            if (key in permissions) {
                if (!permissions[key].includes("owner")) {
                    permissions[key] = [...permissions[key], "owner"];
                }
            }
        }

        const conn = await getConnection();

        await conn.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        permission_key VARCHAR(100) PRIMARY KEY,
        allowed_roles  JSON NOT NULL
      )
    `);

        // Upsert each permission row
        for (const [key, roles] of Object.entries(permissions)) {
            await conn.execute(
                `INSERT INTO permissions (permission_key, allowed_roles)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE allowed_roles = VALUES(allowed_roles)`,
                [key, JSON.stringify(roles)]
            );
        }

        await conn.end();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("PUT PERMISSIONS ERROR:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}