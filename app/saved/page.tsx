
"use client";

import {
  ArrowLeft,
  Bell,
  Bookmark,
  Home,
  Plus,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type SavedPost = {
  id: number;
  image_url: string;
  caption: string | null;
  location: string | null;
  created_at: string;
  user_id: string;
  profiles: Profile | Profile[] | null;
};

type SaveRow = {
  id: number;
  post_id: number;
  created_at: string;
  posts:
    | SavedPost
    | SavedPost[]
    | null;
};

function getProfile(
  profile: Profile | Profile[] | null,
): Profile | null {
  if (!profile) {
    return null;
  }

  return Array.isArray(profile)
    ? profile[0] ?? null
    : profile;
}

function getPost(
  post: SavedPost | SavedPost[] | null,
): SavedPost | null {
  if (!post) {
    return null;
  }

  return Array.isArray(post)
    ? post[0] ?? null
    : post;
}

export default function SavedPage() {
  const supabase = createClient();

  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSavedPosts();
  }, []);

  async function loadSavedPosts() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("saves")
      .select(`
        id,
        post_id,
        created_at,
        posts (
          id,
          user_id,
          image_url,
          caption,
          location,
          created_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading saved posts:", error);
      setErrorMessage("Unable to load your saved posts.");
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as SaveRow[];

    const savedPosts = rows
      .map((row) => getPost(row.posts))
      .filter((post): post is SavedPost => post !== null);

    setPosts(savedPosts);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop header */}
      <header className="sticky top-0 z-50 hidden h-16 border-b border-[var(--border)] bg-[var(--background)] lg:block">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-8">
          <Link
            href="/home"
            className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight"
          >
            Picly
          </Link>

          <nav className="flex items-center gap-7">
            <Link
              href="/home"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Explore
            </Link>

            <Link
              href="/marketplace"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Marketplace
            </Link>

            <Link
              href="/following"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Following
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Search"
              className="transition-opacity hover:opacity-60"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            <Link
              href="/create"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <Plus size={18} strokeWidth={1.8} />
              Create
            </Link>

            <button
              type="button"
              aria-label="Notifications"
              className="transition-opacity hover:opacity-60"
            >
              <Bell size={19} strokeWidth={1.8} />
            </button>

            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-container)] transition-opacity hover:opacity-70"
            >
              <User size={16} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 lg:hidden">
        <Link
          href="/home"
          className="flex items-center gap-2"
          aria-label="Back to home"
        >
          <ArrowLeft size={19} strokeWidth={1.8} />

          <span className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight">
            Picly
          </span>
        </Link>

        <Link
          href="/profile"
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-container)]"
        >
          <User size={16} strokeWidth={1.7} />
        </Link>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="border-b border-[var(--border)] py-8 sm:py-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Your collection
                </p>

                <h1 className="mt-2 font-[var(--font-newsreader)] text-4xl tracking-tight sm:text-5xl">
                  Saved
                </h1>
              </div>

              {!loading && posts.length > 0 && (
                <div className="hidden items-center gap-2 text-sm text-[var(--muted)] sm:flex">
                  <Bookmark size={16} strokeWidth={1.7} />
                  <span>
                    {posts.length}{" "}
                    {posts.length === 1 ? "post" : "posts"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse bg-[var(--surface-container)]"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && errorMessage && (
            <div className="flex min-h-[360px] flex-col items-center justify-center border-b border-[var(--border)] px-6 text-center">
              <Bookmark
                size={28}
                strokeWidth={1.5}
                className="text-[var(--muted)]"
              />

              <h2 className="mt-5 font-[var(--font-newsreader)] text-2xl">
                Something went wrong
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadSavedPosts}
                className="mt-6 border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !errorMessage && posts.length === 0 && (
            <div className="flex min-h-[500px] flex-col items-center justify-center border-b border-[var(--border)] px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-container)]">
                <Bookmark
                  size={24}
                  strokeWidth={1.5}
                  className="text-[var(--foreground)]"
                />
              </div>

              <h2 className="mt-6 font-[var(--font-newsreader)] text-3xl tracking-tight">
                Nothing saved yet
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                Save photos you want to come back to. Your saved posts will
                appear here.
              </p>

              <Link
                href="/explore"
                className="mt-7 inline-flex items-center gap-2 bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-80"
              >
                <Search size={16} strokeWidth={1.8} />
                Explore posts
              </Link>
            </div>
          )}

          {/* Saved posts */}
          {!loading && !errorMessage && posts.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4">
              {posts.map((post) => {
                const profile = getProfile(post.profiles);

                const username =
                  profile?.username ?? "user";

                const caption =
                  post.caption?.trim() || "Picly post";

                return (
                  <Link
                    key={post.id}
                    href={"/post/" + post.id}
                    className="group relative block aspect-square overflow-hidden bg-[var(--surface-container)]"
                  >
                    <img
                      src={post.image_url}
                      alt={caption}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    {/* Hover information */}
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="flex items-end justify-between gap-3 text-white">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            @{username}
                          </p>

                          {post.location && (
                            <p className="mt-1 truncate text-[11px] text-white/75">
                              {post.location}
                            </p>
                          )}
                        </div>

                        <Bookmark
                          size={17}
                          strokeWidth={1.7}
                          fill="currentColor"
                          className="shrink-0"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--background)] lg:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          <Link
            href="/home"
            aria-label="Home"
            className="flex flex-col items-center gap-1 text-[var(--muted)]"
          >
            <Home size={20} strokeWidth={1.7} />
            <span className="text-[9px] font-medium">Home</span>
          </Link>

          <Link
            href="/explore"
            aria-label="Explore"
            className="flex flex-col items-center gap-1 text-[var(--muted)]"
          >
            <Search size={20} strokeWidth={1.7} />
            <span className="text-[9px] font-medium">Explore</span>
          </Link>

          <Link
            href="/create"
            aria-label="Create"
            className="flex h-9 w-9 items-center justify-center border border-[var(--foreground)]"
          >
            <Plus size={19} strokeWidth={1.8} />
          </Link>

          <Link
            href="/marketplace"
            aria-label="Marketplace"
            className="flex flex-col items-center gap-1 text-[var(--muted)]"
          >
            <ShoppingBag size={20} strokeWidth={1.7} />
            <span className="text-[9px] font-medium">Market</span>
          </Link>

          <Link
            href="/profile"
            aria-label="Profile"
            className="flex flex-col items-center gap-1 text-[var(--muted)]"
          >
            <User size={20} strokeWidth={1.7} />
            <span className="text-[9px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
