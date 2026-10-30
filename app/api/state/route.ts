
import { NextResponse } from "next/server";
import { readSupabaseStore } from "../../../lib/supabase-store";

export const dynamic = "force-dynamic";

/**
 * Handle GET /api/state, the dashboard's primary data endpoint. Return the normalised Supabase Store with caching disabled. Map Unauthorized to 401 and other caught errors to 500.
 */
export async function GET() {
  try {
    const store = await readSupabaseStore();

    return NextResponse.json(store, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { error: message },
      {
        status: message === "Unauthorized" ? 401 : 500,
      }
    );
  }
}
