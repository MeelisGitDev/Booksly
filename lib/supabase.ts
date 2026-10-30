
import { createBrowserClient } from "@supabase/ssr";

/** Shared browser Supabase client. The publishable key configures access; session identity and database policies determine what the caller can do. */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
