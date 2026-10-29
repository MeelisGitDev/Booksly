
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("role, companies(id, name, country_code)")
    .eq("user_id", user.id);

  if (membershipError) {
    return NextResponse.json(
      { error: membershipError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    memberships,
  });
}
