import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/welcome"
            className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight"
          >
            Picly
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-[var(--foreground)] transition-opacity hover:opacity-60"
          >
            Log in
          </Link>
        </header>

        {/* Main content */}
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* Text */}
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Welcome to Picly
            </p>

            <h1 className="font-[var(--font-newsreader)] text-5xl leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              See something
              <br />
              worth sharing.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)] sm:text-lg">
              Discover photographs, people, places, and things from a visual
              community built around what catches your eye.
            </p>

            <div className="mt-9 flex items-center gap-5">
              <Link
                href="/welcome/second"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                Continue
              </Link>

              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--foreground)]"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Editorial image composition */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[var(--surface-container)]">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85"
                alt="Fashion editorial photograph"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-5 -left-4 hidden w-44 bg-[var(--background)] p-3 shadow-sm sm:block">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=85"
                  alt="Portrait"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="absolute -right-3 top-8 hidden border border-[var(--border)] bg-[var(--background)] px-4 py-3 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Visual community
              </p>
              <p className="mt-1 font-[var(--font-newsreader)] text-lg">
                Share what you see.
              </p>
            </div>
          </div>
        </section>

        {/* Progress */}
        <footer className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs font-medium text-[var(--muted)]">
            01 / 02
          </p>

          <div className="flex gap-1.5">
            <span className="h-1.5 w-8 rounded-full bg-[var(--foreground)]" />
            <span className="h-1.5 w-8 rounded-full bg-[var(--border)]" />
          </div>
        </footer>
      </div>
    </main>
  );
}