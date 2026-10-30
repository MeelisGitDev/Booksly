
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Render a sign-out button with busy feedback and an inline error message. The actual session change is handled by handleLogout.
 */
export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /**
   * Sign out using the browser Supabase client. On success replace the current URL with /login and refresh server data; on failure display the error. Always clear the busy state.
   */
  async function handleLogout() {
    setBusy(true);
    setError("");

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign out failed"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="logout-control">
      <button
        type="button"
        className="reset"
        onClick={handleLogout}
        disabled={busy}
      >
        {busy ? "Signing out..." : "Sign out"}
      </button>

      {error && (
        <small role="alert" className="logout-error">
          {error}
        </small>
      )}
    </div>
  );
}
