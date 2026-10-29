
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

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
