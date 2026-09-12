import Link from "next/link";

export default function TermsPage() {
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
              Legal
            </p>

            <h1 className="font-[var(--font-newsreader)] text-5xl leading-none tracking-tight sm:text-6xl">
              Terms of Use
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              These terms explain the basic rules for using Picly while the
              platform is being tested and developed.
            </p>

            <p className="mt-4 text-xs text-[var(--muted)]">
              Last updated: September 2026
            </p>
          </div>
        </header>

        <div className="space-y-12">
          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              1. About Picly
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly is an image-first social platform where people can share
              photos, discover content, interact with other users, and
              optionally list items shown in their photos for sale.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly is currently in testing. Features, designs, and services
              may change as the platform develops.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              2. Using Picly
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              By creating an account or using Picly, you agree to use the
              platform responsibly and follow these terms.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              You are responsible for the activity that takes place through
              your account and for keeping your login information secure.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              3. Your account
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
              <li>• Provide accurate information when creating your account.</li>
              <li>• Do not impersonate another person or organization.</li>
              <li>• Do not share your account credentials with others.</li>
              <li>
                • Notify us if you believe your account has been accessed
                without permission.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              4. Your content
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              You retain ownership of the photos, captions, and other content
              you submit to Picly.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              By posting content, you give Picly permission to store, display,
              reproduce, and technically process that content as necessary to
              operate and improve the service.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              You are responsible for making sure that you have the necessary
              rights and permissions to upload and share your content.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              5. Prohibited behavior
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              You must not use Picly to:
            </p>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
              <li>• Break applicable laws or regulations.</li>
              <li>• Harass, threaten, or intentionally harm other users.</li>
              <li>• Upload malicious software or harmful code.</li>
              <li>• Spam, scam, or deceive other users.</li>
              <li>• Impersonate another person.</li>
              <li>• Upload content that you do not have permission to use.</li>
              <li>• Attempt to gain unauthorized access to Picly systems.</li>
              <li>• Abuse or manipulate platform features.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              6. Marketplace listings
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Some Picly posts may include items offered for sale. Sellers are
              responsible for the accuracy of their listings, including the
              product description, price, condition, location, and availability.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly does not currently act as the seller of listed products.
              Users should independently verify important details before
              arranging a transaction.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly is currently developing its marketplace functionality.
              Availability and transaction features may change during testing.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              7. User interactions
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Likes, comments, follows, saves, messages, and other interactions
              are provided to support the community experience.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Do not use these features to harass people, distribute spam, or
              manipulate engagement.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              8. Content moderation
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly may remove content or restrict accounts that violate these
              terms, applicable law, or the safety of the community.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              During the testing period, moderation processes and reporting
              tools may continue to evolve.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              9. Availability
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly is provided during an active testing and development
              period. The service may occasionally be unavailable, changed,
              interrupted, or discontinued.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              We do not guarantee that every feature will always be available
              or operate without interruption.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              10. Intellectual property
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly's name, branding, interface, software, and other original
              platform materials are protected by applicable intellectual
              property laws.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              You may not copy, reproduce, modify, or commercially exploit
              Picly's platform materials without permission.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              11. Account suspension or termination
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              We may suspend or terminate an account if it is used in a way
              that violates these terms, creates a security risk, or harms the
              Picly community.
            </p>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              You may stop using Picly at any time and may request deletion of
              your account and associated information through the available
              account or support process.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              12. Disclaimer
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Picly is provided on an evolving, testing basis. To the extent
              permitted by applicable law, Picly is provided without guarantees
              that the service will always be available, accurate, secure, or
              suitable for every purpose.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              13. Changes to these terms
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              These terms may be updated as Picly develops. When important
              changes are made, the updated version will be published on this
              page with a new update date.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-newsreader)] text-2xl">
              14. Contact
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              If you have questions about these terms or Picly's testing
              program, use the support contact provided by Picly.
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-[var(--border)] pt-8">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)]">
            <Link href="/about" className="hover:text-[var(--foreground)]">
              About
            </Link>

            <Link href="/privacy" className="hover:text-[var(--foreground)]">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-[var(--foreground)]">
              Terms of Use
            </Link>

            <Link href="/settings" className="hover:text-[var(--foreground)]">
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