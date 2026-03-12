import { getConnection } from "../../lib/db";

export async function GET() {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query("SELECT * FROM sensor_data");
        await connection.end();

        return new Response(JSON.stringify(rows), {
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