"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <header>
          <Link
            href="/welcome"
            className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight"
          >
            Picly
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">
          <div className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Welcome back
            </p>

            <h1 className="font-[var(--font-newsreader)] text-5xl leading-tight tracking-tight text-[var(--foreground)]">
              Log in to Picly.
            </h1>

            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Continue sharing, discovering, and connecting with the Picly
              community.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)]"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                disabled={loading}
                autoComplete="current-password"
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="border border-[var(--error)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--error)]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted)]">OR</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <button
            type="button"
            disabled
            className="h-12 w-full cursor-not-allowed rounded-lg border border-[var(--border)] bg-transparent px-6 text-sm font-semibold text-[var(--foreground)] opacity-60"
          >
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-[var(--muted)]">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[var(--foreground)] underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}