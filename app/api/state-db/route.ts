
import { NextResponse } from "next/server";
import { readSupabaseStore } from "../../../lib/supabase-store";

export const dynamic = "force-dynamic";

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
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
