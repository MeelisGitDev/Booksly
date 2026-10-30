
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { readSupabaseStore } from "../../../lib/supabase-store";

export const dynamic = "force-dynamic";

/**
 * Handle POST /api/action for a signed-in user. Reset calls reset_booksly_demo; other supported actions validate the request, resolve the demo ID under RLS, and call apply_bookkeeping_action with the proposal version. Return a refreshed Store on success; return JSON errors with 400, 401, 403, 404, 409 or 500 status codes as applicable.
 */
export async function POST(req: Request) {
  try {
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

    const body = await req.json();

    // Delegate the database demo reset to the installed RPC; its scope and permissions live in PostgreSQL.
    if (body.action === "reset") {
  const { error } = await supabase.rpc("reset_booksly_demo");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }

  const store = await readSupabaseStore();

  return NextResponse.json(store, {
    headers: { "Cache-Control": "no-store" },
  });
}

    if (
      typeof body.id !== "string" ||
      !Number.isInteger(body.version) ||
      !["customer_answer", "approve", "reclassify"].includes(body.action)
    ) {
      return NextResponse.json(
        { error: "Invalid action request" },
        { status: 400 }
      );
    }

    // Resolve the demo ID to the actual PostgreSQL UUID.
    // RLS limits this lookup to accessible transactions.
    const { data: transaction, error: lookupError } = await supabase
      .from("transactions")
      .select("id")
      .eq("demo_id", body.id)
      .single();

    if (lookupError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const { error: actionError } = await supabase.rpc(
      "apply_bookkeeping_action",
      {
        p_transaction_id: transaction.id,
        p_action: body.action,
        p_version: body.version,
        p_answer: body.answer ?? null,
        p_category: body.category ?? null,
      }
    );

    if (actionError) {
      const message = actionError.message;

      return NextResponse.json(
        { error: message },
        {
          status: message.includes("Refresh before acting")
            ? 409
            : 400,
        }
      );
    }

    const store = await readSupabaseStore();

    return NextResponse.json(store, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
