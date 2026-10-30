
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Handle GET /api/transactions for a signed-in user. Return raw database transactions with nested classifications and a count, ordered by transaction date. Database RLS determines visible rows; this endpoint does not apply the first-company filter used by readSupabaseStore. Return 401 for authentication failure or 500 for a query error.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      demo_id,
      source,
      source_transaction_id,
      transaction_date,
      description,
      amount,
      currency,
      kind,
      reconciliation,
      is_transfer,
      classifications (
        category,
        status,
        evidence,
        reason,
        customer_answer,
        version
      )
    `)
    .order("transaction_date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    count: data?.length ?? 0,
    transactions: data ?? [],
  });
}
