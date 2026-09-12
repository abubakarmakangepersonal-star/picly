import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-14 border-b border-[var(--border)] pb-8">
          <Link
            href="/"
            className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight"
          >
            Picly
          </Link>

          <div className="mt-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              About
            </p>

            <h1 className="font-[var(--font-newsreader)] text-5xl leading-none tracking-tight sm:text-6xl">
              Share what you see.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
              Picly is an image-first social platform built around a simple
              idea: people share photos, discover things, and connect through
              what they see.
            </p>
          </div>
        </header>

        <div className="space-y-14">
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
              The idea
            </p>

            <h2 className="mt-3 font-[var(--font-newsreader)] text-3xl tracking-tight sm:text-4xl">
              Photos first. Everything else follows.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Picly is designed around visual discovery rather than endless
              streams of text. Share something you see, discover what other
              people are sharing, and interact with the people behind those
              images.
            </p>
          </section>

          <section className="grid gap-8 border-y border-[var(--border)] py-10 sm:grid-cols-3">
            <div>
              <p className="font-[var(--font-newsreader)] text-2xl">01</p>

              <h3 className="mt-3 text-sm font-semibold">
                Share
              </h3>

              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                Post photos, write captions, and share moments with the
                community.
              </p>
            </div>

            <div>
              <p className="font-[var(--font-newsreader)] text-2xl">02</p>

              <h3 className="mt-3 text-sm font-semibold">
                Discover
              </h3>

              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                Explore people, photographs, and interesting things from
                different creators.
              </p>
            </div>

            <div>
              <p className="font-[var(--font-newsreader)] text-2xl">03</p>

              <h3 className="mt-3 text-sm font-semibold">
                Sell
              </h3>

              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                Some photos can also become marketplace listings for the item
                shown.
              </p>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
              Marketplace
            </p>

            <h2 className="mt-3 font-[var(--font-newsreader)] text-3xl tracking-tight sm:text-4xl">
              Turn a photo into an opportunity.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Picly connects social discovery with a lightweight marketplace.
              When you post a photo of something you want to sell, you can
              optionally add product information and make it available as a
              listing.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              The goal is to keep buying and selling connected to the visual
              experience rather than turning Picly into a traditional
              classifieds platform.
            </p>
          </section>

          <section className="border border-[var(--border)] bg-[var(--surface-container-low)] p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--foreground)] text-[var(--background)]">
                <span className="font-[var(--font-newsreader)] text-xl">
                  P
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
                  Current status
                </p>

                <h2 className="mt-2 font-[var(--font-newsreader)] text-2xl tracking-tight">
                  Picly is currently in testing.
                </h2>

                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  This is an early version of Picly. Some features are still
                  being developed, tested, and improved before the platform is
                  ready for a wider launch.
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
              What's coming
            </p>

            <h2 className="mt-3 font-[var(--font-newsreader)] text-3xl tracking-tight sm:text-4xl">
              More is on the way.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Picly will continue to evolve as we learn from testing and
              feedback. More community, marketplace, communication, discovery,
              and personalization features are planned.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              The focus is to keep the experience useful, visual, simple, and
              distinctly Picly.
            </p>
          </section>

          <section className="border-t border-[var(--border)] pt-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
              Transparency
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Because Picly is still being tested, features and policies may
              change as the product develops. For more information, review our
              Privacy Policy and Terms of Use.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="border border-[var(--border)] px-5 py-3 text-xs font-semibold transition-colors hover:bg-[var(--surface-container-low)]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="border border-[var(--border)] px-5 py-3 text-xs font-semibold transition-colors hover:bg-[var(--surface-container-low)]"
              >
                Terms of Use
              </Link>
            </div>
          </section>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-8">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)]">
            <Link
              href="/about"
              className="hover:text-[var(--foreground)]"
            >
              About
            </Link>

            <Link
              href="/privacy"
              className="hover:text-[var(--foreground)]"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="hover:text-[var(--foreground)]"
            >
              Terms
            </Link>

            <Link
              href="/settings"
              className="hover:text-[var(--foreground)]"
            >
              Settings
            </Link>
          </div>

          <p className="mt-6 text-xs text-[var(--muted)]">
            © 2026 Picly. Currently in testing.
          </p>
        </footer>
      </div>
    </main>
  );
}