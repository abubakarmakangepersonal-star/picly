"use client";

import {
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  Info,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Shield,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("picly-theme") as Theme | null;

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("system");
    }
  }, []);

  function applyTheme(selectedTheme: Theme) {
    const root = document.documentElement;

    const dark =
      selectedTheme === "dark" ||
      (selectedTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", dark);
  }

  function changeTheme(selectedTheme: Theme) {
    setTheme(selectedTheme);
    localStorage.setItem("picly-theme", selectedTheme);
    applyTheme(selectedTheme);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/home"
            className="font-[var(--font-newsreader)] text-2xl font-medium tracking-tight"
          >
            Picly
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-60"
          >
            <UserRound size={18} strokeWidth={1.7} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-12">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
            Account
          </p>

          <h1 className="font-[var(--font-newsreader)] text-4xl leading-tight tracking-tight sm:text-5xl">
            Settings
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Manage your Picly account, appearance, privacy, notifications,
            and preferences.
          </p>
        </div>

        <section>
          <SectionLabel>Account</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <SettingsLink
              href="/profile"
              icon={<UserRound size={19} strokeWidth={1.6} />}
              title="Edit profile"
              description="Update your name, username, photo, and bio."
            />

            <SettingsLink
              href="/settings/security"
              icon={<Lock size={19} strokeWidth={1.6} />}
              title="Password & security"
              description="Manage your password and account security."
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Appearance</SectionLabel>

          <div className="border-y border-[var(--border)] py-5">
            <div className="mb-5">
              <p className="text-sm font-semibold">Theme</p>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Choose how Picly looks on your device.
              </p>
            </div>

            <div className="grid grid-cols-3 border border-[var(--border)]">
              <ThemeButton
                icon={<Sun size={18} strokeWidth={1.7} />}
                label="Light"
                active={theme === "light"}
                onClick={() => changeTheme("light")}
                bordered
              />

              <ThemeButton
                icon={<Moon size={18} strokeWidth={1.7} />}
                label="Dark"
                active={theme === "dark"}
                onClick={() => changeTheme("dark")}
                bordered
              />

              <ThemeButton
                icon={<Monitor size={18} strokeWidth={1.7} />}
                label="System"
                active={theme === "system"}
                onClick={() => changeTheme("system")}
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Notifications</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <ToggleRow
              icon={<Bell size={19} strokeWidth={1.6} />}
              title="Push notifications"
              description="Receive notifications about activity on your account."
              enabled={notifications}
              onChange={() => setNotifications((value) => !value)}
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Privacy</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <ToggleRow
              icon={<Lock size={19} strokeWidth={1.6} />}
              title="Private account"
              description="Only people you approve can follow and view your posts."
              enabled={privateAccount}
              onChange={() => setPrivateAccount((value) => !value)}
            />

            <SettingsLink
              href="/settings/privacy"
              icon={<Shield size={19} strokeWidth={1.6} />}
              title="Privacy settings"
              description="Manage visibility, messaging, and activity preferences."
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Safety</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <SettingsLink
              href="/settings/blocked"
              icon={<Shield size={19} strokeWidth={1.6} />}
              title="Blocked users"
              description="Manage accounts you have blocked."
            />

            <SettingsLink
              href="/settings/security"
              icon={<Lock size={19} strokeWidth={1.6} />}
              title="Security"
              description="Review security options for your account."
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Support</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <SettingsLink
              href="/help"
              icon={<CircleHelp size={19} strokeWidth={1.6} />}
              title="Help & support"
              description="Find answers and get help with Picly."
            />

            <button
              type="button"
              className="flex w-full items-center gap-4 border-t border-[var(--border)] py-5 text-left transition-opacity hover:opacity-60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-container)]">
                <CircleHelp size={19} strokeWidth={1.6} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  Report a problem
                </span>

                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                  Tell us about something that is not working correctly.
                </span>
              </span>

              <ChevronRight
                size={18}
                strokeWidth={1.6}
                className="shrink-0 text-[var(--muted)]"
              />
            </button>
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Legal & About</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <SettingsLink
              href="/about"
              icon={<Info size={19} strokeWidth={1.6} />}
              title="About Picly"
              description="Learn about Picly, our vision, and the current testing phase."
            />

            <SettingsLink
              href="/privacy"
              icon={<Shield size={19} strokeWidth={1.6} />}
              title="Privacy Policy"
              description="Learn how Picly handles information and user content."
            />

            <SettingsLink
              href="/terms"
              icon={<FileText size={19} strokeWidth={1.6} />}
              title="Terms of Use"
              description="Review the rules and terms for using Picly."
            />

            <div className="flex items-center gap-4 border-t border-[var(--border)] py-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-container)]">
                <span className="font-[var(--font-newsreader)] text-lg">
                  P
                </span>
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Picly</p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Version 0.1.0 · Currently in testing
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Account actions</SectionLabel>

          <div className="border-y border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="flex w-full items-center gap-4 py-5 text-left transition-opacity hover:opacity-60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-container)]">
                <LogOut size={19} strokeWidth={1.6} />
              </span>

              <span className="flex-1">
                <span className="block text-sm font-semibold">Log out</span>

                <span className="mt-1 block text-xs text-[var(--muted)]">
                  Sign out of your Picly account.
                </span>
              </span>

              <ChevronRight
                size={18}
                strokeWidth={1.6}
                className="text-[var(--muted)]"
              />
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-4 border-t border-[var(--border)] py-5 text-left text-[var(--error)] transition-opacity hover:opacity-60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-container)]">
                <Trash2 size={19} strokeWidth={1.6} />
              </span>

              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Delete account
                </span>

                <span className="mt-1 block text-xs text-[var(--muted)]">
                  Permanently remove your Picly account and data.
                </span>
              </span>

              <ChevronRight
                size={18}
                strokeWidth={1.6}
                className="text-[var(--muted)]"
              />
            </button>
          </div>
        </section>

        <footer className="mt-16 border-t border-[var(--border)] pt-6">
          <p className="font-[var(--font-newsreader)] text-lg">Picly</p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Share what you see.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
            <Link
              href="/about"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              About
            </Link>

            <Link
              href="/privacy"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Terms
            </Link>
          </div>
        </footer>
      </div>

      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm border border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowLogout(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <X size={19} strokeWidth={1.7} />
            </button>

            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--secondary)]">
              Account
            </p>

            <h2 className="mt-3 font-[var(--font-newsreader)] text-3xl tracking-tight">
              Log out of Picly?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              You can log back in at any time using your account credentials.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogout(false)}
                className="flex-1 border border-[var(--border)] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-container-low)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setShowLogout(false)}
                className="flex-1 bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-80"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--secondary)]">
      {children}
    </p>
  );
}

function ThemeButton({
  icon,
  label,
  active,
  onClick,
  bordered = false,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  bordered?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-3 py-4 text-xs font-semibold transition-colors ${
        bordered ? "border-r border-[var(--border)]" : ""
      } ${
        active
          ? "bg-[var(--foreground)] text-[var(--background)]"
          : "hover:bg-[var(--surface-container-low)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border-b border-[var(--border)] py-5 last:border-b-0 transition-opacity hover:opacity-60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-container)]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>

        <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
          {description}
        </span>
      </span>

      <ChevronRight
        size={18}
        strokeWidth={1.6}
        className="shrink-0 text-[var(--muted)]"
      />
    </Link>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--surface-container)]">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={`${title}: ${enabled ? "on" : "off"}`}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled
            ? "bg-[var(--foreground)]"
            : "bg-[var(--surface-container-highest)]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${
            enabled
              ? "translate-x-6 bg-[var(--background)]"
              : "translate-x-1 bg-[var(--muted)]"
          }`}
        />
      </button>
    </div>
  );
}