import { getConnection } from "../../lib/db";
import { UserPermissions } from "../../lib/permissions";

export async function GET(req: Request) {
    try {
        // Get user type from middleware
        const userType = req.headers.get('x-user-type');

        if (!userType) {
            return new Response(
                JSON.stringify({ error: "User not authenticated" }),
                { status: 401 }
            );
        }

        // Check if user has permission to view temperature data
        if (!UserPermissions.hasPermission(userType, 'VIEW_TEMPERATURE')) {
            return new Response(
                JSON.stringify({ error: "Access denied" }),
                { status: 403 }
            );
        }

        const connection = await getConnection();
        const [rows] = await connection.query("SELECT * FROM sensor_data");
        await connection.end();

        // Filter data based on user permissions
        let filteredData = rows as any[];

        // Guests only see the last 24 hours of data
        if (userType === 'guest') {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            filteredData = filteredData.filter((row: any) =>
                new Date(row.ts) >= twentyFourHoursAgo
            );
        }

        return new Response(JSON.stringify(filteredData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("DB ERROR:", error); // <-- detailed error logging
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch sensor data", details: errorMessage }),
            { status: 500 }
        );
    }
}