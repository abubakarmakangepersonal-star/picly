import Link from "next/link";

export default function SecondWelcomePage() {
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

        {/* Main */}
        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Image composition */}
          <div className="order-2 mx-auto w-full max-w-lg lg:order-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[var(--surface-container)]">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"
                  alt="Fashion photograph"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-12 aspect-[4/5] overflow-hidden rounded-xl bg-[var(--surface-container)]">
                <img
                  src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85"
                  alt="Creative workspace"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Share
              </span>

              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Discover
              </span>

              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Sell
              </span>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 max-w-xl lg:order-2">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              More than a photo
            </p>

            <h1 className="font-[var(--font-newsreader)] text-5xl leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Share moments.
              <br />
              Find what matters.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)] sm:text-lg">
              Follow people whose taste you love, discover new things, and
              turn the right photo into an opportunity to sell.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                Get started
              </Link>

              <Link
                href="/welcome"
                className="text-sm font-semibold text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--foreground)]"
              >
                Back
              </Link>
            </div>
          </div>
        </section>

        {/* Progress */}
        <footer className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-xs font-medium text-[var(--muted)]">
            02 / 02
          </p>

          <div className="flex gap-1.5">
            <span className="h-1.5 w-8 rounded-full bg-[var(--foreground)]" />
            <span className="h-1.5 w-8 rounded-full bg-[var(--foreground)]" />
          </div>
        </footer>
      </div>
    </main>
  );
}