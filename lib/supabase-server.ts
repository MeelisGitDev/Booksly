
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for the current server request using its session cookies. API routes use this client so Supabase can identify the caller and apply database access policies. Requires the public URL and publishable key environment variables.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        /**
         * Return all request cookies so the Supabase client can read the current authentication session.
         */
        getAll() {
          return cookieStore.getAll();
        },
        /**
         * Apply session cookie updates requested by Supabase. Cookie writes are attempted together; errors are ignored because some Server Component contexts cannot write response cookies.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(/** Write one Supabase session cookie, including its expiry and other options, to the current cookie store. */ ({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie updates are unavailable in some Server Components.
          }
        },
      },
    }
  );
}
