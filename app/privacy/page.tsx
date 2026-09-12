import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
return ( <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"> <header className="border-b border-[var(--border)]"> <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"> <Link
         href="/home"
         className="font-[var(--font-newsreader)] text-2xl font-medium tracking-tight"
       >
Picly </Link>

```
      <Link
        href="/settings"
        className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60"
      >
        <ArrowLeft size={17} strokeWidth={1.7} />
        Settings
      </Link>
    </div>
  </header>

  <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
    <div className="mb-12">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
        Legal
      </p>

      <h1 className="font-[var(--font-newsreader)] text-5xl tracking-tight sm:text-6xl">
        Privacy Policy
      </h1>

      <p className="mt-4 text-sm text-[var(--muted)]">
        Last updated: September 2026
      </p>
    </div>

    <div className="space-y-10 text-sm leading-7">
      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          1. Introduction
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Picly is an image-first social platform currently in testing.
          This Privacy Policy explains what information may be collected
          when you use Picly and how that information is used.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          2. Information you provide
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          When you create and use a Picly account, you may provide
          information such as your email address, name, username, profile
          photo, biography, and other profile information.
        </p>

        <p className="mt-3 text-[var(--muted)]">
          You may also provide photos, captions, comments, marketplace
          listings, product information, prices, and other content when
          using the platform.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          3. Activity on Picly
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Picly may store information about your activity, including posts
          you create, posts you like or save, comments, follows, and
          marketplace listings you create.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          4. How information is used
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Information may be used to provide and operate Picly, display
          your profile and content, provide social features, support
          marketplace functionality, maintain account security, improve
          the service, and communicate important information about your
          account.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          5. Public information
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Information you choose to make public on Picly may be visible to
          other users. This can include your username, profile information,
          photos, captions, comments, and marketplace listings.
        </p>

        <p className="mt-3 text-[var(--muted)]">
          Do not publish information that you do not want other people to
          see.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          6. Marketplace information
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          If you create a marketplace listing, information such as the
          product name, price, currency, condition, location, and photos
          may be displayed to other users as part of the listing.
        </p>

        <p className="mt-3 text-[var(--muted)]">
          Picly is currently a lightweight marketplace feature and does
          not process or guarantee transactions unless explicitly stated
          within the service.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          7. Service providers
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Picly may rely on third-party service providers for infrastructure,
          authentication, databases, storage, hosting, analytics, or other
          technical services required to operate the platform.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          8. Security
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Reasonable technical and organizational measures are used to
          protect information. However, no internet service can guarantee
          complete security.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          9. Data retention and deletion
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          Information may be retained for as long as necessary to provide
          the service, maintain security, comply with legal obligations,
          resolve disputes, or support legitimate operational purposes.
        </p>

        <p className="mt-3 text-[var(--muted)]">
          Account deletion and data-management functionality may change as
          Picly develops from its testing version into a production
          service.
        </p>
      </section>

      <section>
        <h2 className="font-[var(--font-newsreader)] text-2xl">
          10. Changes to this policy
        </h2>

        <p className="mt-3 text-[var(--muted)]">
          This Privacy Policy may be updated as Picly develops. Changes
          will be reflected on this page with an updated revision date.
        </p>
      </section>

      <section className="border-t border-[var(--border)] pt-8">
        <p className="text-[var(--muted)]">
          Picly is currently in testing, and some privacy controls and
          account-management features are still being developed.
        </p>

        <div className="mt-6 flex flex-wrap gap-5 font-semibold">
          <Link
            href="/about"
            className="transition-opacity hover:opacity-60"
          >
            About Picly
          </Link>

          <Link
            href="/terms"
            className="transition-opacity hover:opacity-60"
          >
            Terms of Use
          </Link>
        </div>
      </section>
    </div>

    <footer className="mt-20 border-t border-[var(--border)] pt-6">
      <p className="font-[var(--font-newsreader)] text-lg">Picly</p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Share what you see.
      </p>
    </footer>
  </div>
</main>


);
}
