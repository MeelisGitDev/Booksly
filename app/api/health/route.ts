
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Handle GET /api/health for a verified user using the request's server client.
 * Return 401 without a session; otherwise check a company query under RLS.
 * Query success, even with zero visible rows, does not prove full database health.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("companies")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json({
      connected: false,
      error: error.message,
    }, { status: 500 });
  }

  return NextResponse.json({
    connected: true,
    database: "Supabase PostgreSQL",
  });
}
