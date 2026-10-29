
import type { Store, Transaction, Status } from "./types";
import { createSupabaseServerClient } from "./supabase-server";

type ClassificationRow = {
  category: string | null;
  status: string;
  evidence: string | null;
  reason: string | null;
  customer_answer: string | null;
  version: number;
};

const statusMap: Record<string, Status> = {
  ready_for_review: "READY",
  needs_customer: "NEEDS_CUSTOMER",
  needs_accountant: "NEEDS_ACCOUNTANT",
  approved: "APPROVED",
};

export async function readSupabaseStore(): Promise<Store> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: memberships, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id);

  if (memberError) throw new Error(memberError.message);
  if (!memberships?.length) throw new Error("No company membership");

  // Demo uses the first company membership.
  const companyId = memberships[0].company_id;

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
      ),
      audit_logs (
        action,
        details,
        created_at,
        actor_id
        )
    `)
    .eq("company_id", companyId)
    .order("transaction_date", { ascending: true });

  if (error) throw new Error(error.message);

  const transactions: Transaction[] = (data ?? []).map((row) => {
    const c = (Array.isArray(row.classifications)
      ? row.classifications[0]
      : row.classifications) as ClassificationRow | null;

    if (!c) {
      throw new Error(`Missing classification for ${row.demo_id}`);
    }

    const status = statusMap[c.status];
    if (!status) {
      throw new Error(`Unsupported status: ${c.status}`);
    }

    return {
      id: row.demo_id ?? row.id,
      provider: row.source === "stripe" ? "Stripe" : "Airwallex",
      ref: row.source_transaction_id,
      merchant: row.description ?? "",
      date: row.transaction_date.slice(0, 10),
      amount: Number(row.amount),
      currency: row.currency,
      kind: row.kind ?? "",
      category: c.category ?? "Unclassified",
      status,
      evidence: c.evidence ?? "",
      reason: c.reason ?? undefined,
      customerAnswer: c.customer_answer ?? undefined,
      version: c.version,
      reconciliation: row.reconciliation ?? undefined,
      isTransfer: row.is_transfer,
      audit: (row.audit_logs ?? [])
  .map((event) => {
    const details = event.details as {
      actor?: string;
    } | null;

    return {
      at: event.created_at,
      actor:
        details?.actor ??
        (event.actor_id ? "Authenticated user" : "System"),
      action: event.action,
    };
  })
  .sort((a, b) => a.at.localeCompare(b.at)),
    };
  });

  return {
    transactions,
    updatedAt: new Date().toISOString(),
  };
}
