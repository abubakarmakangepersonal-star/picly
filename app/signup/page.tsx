"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Account could not be created.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        username: username.trim().toLowerCase(),
        display_name: name.trim(),
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created successfully.");

    setTimeout(() => {
      router.push("/home");
    }, 800);
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
              Join Picly
            </p>

            <h1 className="font-[var(--font-newsreader)] text-5xl leading-tight tracking-tight text-[var(--foreground)]">
              Create your account.
            </h1>

            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Start sharing, discovering, and connecting with the Picly
              community.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                disabled={loading}
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="yourusername"
                disabled={loading}
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
              />
            </div>

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
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground)]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                disabled={loading}
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="border border-[var(--error)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--error)]">
                {error}
              </div>
            )}

            {success && (
              <div className="border border-[var(--border)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--foreground)]">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--foreground)] underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}