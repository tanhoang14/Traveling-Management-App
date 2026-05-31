/**
 * API route for database keep-alive
 * Endpoint: GET /api/database-ping
 *
 * This endpoint:
 * 1. Adds a dummy record to keep the database active
 * 2. Cleans up old dummy records (older than 7 days)
 *
 * Should be called periodically via cron job or external service
 * (e.g., every 6 hours or daily)
 */

import { addDummyRecord, cleanupDummyRecords } from "@/lib/dummyRecordManager";

export async function GET(request: Request) {
  try {
    // Verify the request is authorized (optional security check)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    // If CRON_SECRET is set, validate the token
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add a new dummy record to keep database active
    const addResult = await addDummyRecord();

    // Clean up old dummy records
    const cleanupResult = await cleanupDummyRecords(7); // Keep records for 7 days

    if (!addResult.success || !cleanupResult.success) {
      return Response.json(
        {
          error: "Failed to complete database maintenance",
          addResult,
          cleanupResult,
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Database maintenance completed successfully",
        timestamp: new Date().toISOString(),
        addResult,
        cleanupResult,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Database ping endpoint error:", error);
    return Response.json(
      {
        error: "Internal server error",
        message: String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  // Allow POST requests for testing purposes
  return GET(request);
}
