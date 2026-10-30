
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FileCheck2, Layers3, LoaderCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

/**
 * Render the branded sign-in page and keep email, password, loading and error values in React state. Authentication is performed by handleLogin, not by the presentation markup.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Prevent the form's browser reload and call Supabase signInWithPassword with the entered credentials. Show authentication errors; on success navigate to the dashboard and refresh Next.js server data.
   */
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="login-headline">
        <a className="login-brand" href="/login" aria-label="Booksly home">booksly<span>.</span></a>
        <div className="login-story-content">
          <div className="story-eyebrow"><span /> BOOKKEEPING, WITH PERSPECTIVE</div>
          <h1 id="login-headline">Less paperwork.<br />More clarity.</h1>
          <p className="login-description">A clearer picture of your books, a little more room for your business. Bring transactions, questions and accountant reviews together in one workspace.</p>
          <div className="workflow-card">
            <div className="workflow-heading"><span className="workflow-icon"><Layers3 size={20} /></span><div><strong>From transaction to clarity</strong><small>One connected bookkeeping workflow</small></div></div>
            <div className="workflow-steps"><span><Check size={14} /> Organise</span><i /><span><Check size={14} /> Clarify</span><i /><span><FileCheck2 size={14} /> Review</span></div>
            <p>You provide the context. Your accountant makes the final call.</p>
          </div>
        </div>
        <div className="login-story-footer"><span className="location-dot" /> Built for businesses in Singapore</div>
      </section>
      <section className="login-form-panel" aria-labelledby="signin-heading">
        <div className="login-form-card">
          <span className="eyebrow">YOUR BOOKSLY WORKSPACE</span>
          <h2 id="signin-heading">Welcome back.</h2>
          <p className="login-form-intro">Sign in to keep your bookkeeping moving.</p>
          <form onSubmit={handleLogin} className="login-form" aria-busy={loading}>
            <div><label htmlFor="email" className="field-label">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={/** Update the email input's React state as the user types. */ (e) => setEmail(e.target.value)} required /></div>
            <div><label htmlFor="password" className="field-label">Password</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={/** Update the password input's React state as the user types; this callback does not log or send the password. */ (e) => setPassword(e.target.value)} required /></div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="primary login-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle size={18} className="spin" /> Signing in…</> : <>Sign in <ArrowRight size={18} /></>}</button>
          </form>
          <p className="login-access-note">Use the email and password associated with your workspace.</p>
        </div>
        <p className="login-footer">Booksly <span>·</span> Trust before automation</p>
      </section>
    </main>
  );
}
