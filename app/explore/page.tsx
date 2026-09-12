"use client";

import {
  Bell,
  Compass,
  Home,
  Plus,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Post = {
  id: number;
  user_id: string;
  image_url: string;
  caption: string | null;
  location: string | null;
  created_at: string;
  profiles: Profile | Profile[] | null;
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

function formatTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  let seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000,
  );

  if (seconds < 0) {
    seconds = 0;
  }

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  const sameYear =
    date.getFullYear() === now.getFullYear();

  if (sameYear) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ExplorePage() {
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("posts")
      .select(`
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
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Explore posts loading failed:",
        error,
      );

      setErrorMessage(
        "Unable to load posts right now.",
      );

      setPosts([]);
      setLoading(false);
      return;
    }

    setPosts((data ?? []) as Post[]);
    setLoading(false);
  }

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const profile = getProfile(post.profiles);

      const username =
        profile?.username?.toLowerCase() ?? "";

      const displayName =
        profile?.display_name?.toLowerCase() ?? "";

      const caption =
        post.caption?.toLowerCase() ?? "";

      const location =
        post.location?.toLowerCase() ?? "";

      return (
        username.includes(query) ||
        displayName.includes(query) ||
        caption.includes(query) ||
        location.includes(query)
      );
    });
  }, [posts, search]);

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
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <Compass
                size={17}
                strokeWidth={1.8}
              />
              Explore
            </Link>

            <Link
              href="/marketplace"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Marketplace
            </Link>

            <Link
              href="/following"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Following
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Search"
              className="text-[var(--foreground)] hover:opacity-60"
            >
              <Search
                size={19}
                strokeWidth={1.8}
              />
            </button>

            <Link
              href="/create"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <Plus
                size={18}
                strokeWidth={1.8}
              />
              Create
            </Link>

            <Link
              href="/notifications"
              aria-label="Notifications"
              className="text-[var(--foreground)] hover:opacity-60"
            >
              <Bell
                size={19}
                strokeWidth={1.8}
              />
            </Link>

            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-container)]"
            >
              <User
                size={16}
                strokeWidth={1.7}
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 lg:hidden">
        <Link
          href="/home"
          className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight"
        >
          Picly
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="text-[var(--foreground)]"
          >
            <Bell
              size={19}
              strokeWidth={1.8}
            />
          </Link>

          <Link
            href="/profile"
            aria-label="Profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-container)]"
          >
            <User
              size={16}
              strokeWidth={1.7}
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        {/* Page heading */}
        <section className="border-b border-[var(--border)] py-8 sm:py-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--secondary)]">
            Explore
          </p>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <h1 className="max-w-2xl font-[var(--font-newsreader)] text-4xl leading-tight tracking-tight sm:text-5xl">
              Find something worth looking at.
            </h1>

            <div className="flex w-full items-center border border-[var(--border)] bg-[var(--surface-container-low)] px-3 sm:w-72">
              <Search
                size={17}
                strokeWidth={1.7}
                className="shrink-0 text-[var(--muted)]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search Picly"
                className="h-10 w-full bg-transparent px-3 text-sm outline-none placeholder:text-[var(--muted)]"
              />
            </div>
          </div>
        </section>

        {/* Data status */}
        {!loading && !errorMessage && (
          <div className="flex items-center justify-between border-b border-[var(--border)] py-4">
            <p className="text-xs text-[var(--muted)]">
              {search
                ? `${filteredPosts.length} results`
                : `${posts.length} posts`}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-[var(--secondary)]"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Trending */}
        <section className="py-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Trending now
              </p>

              <h2 className="mt-1 font-[var(--font-newsreader)] text-2xl tracking-tight">
                Visual discoveries
              </h2>
            </div>

            {!loading && (
              <span className="text-xs text-[var(--muted)]">
                {filteredPosts.length} posts
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden bg-[var(--surface-container)]"
                  >
                    <div className="aspect-[4/5] animate-pulse bg-[var(--surface-container-high)]" />

                    <div className="space-y-2 p-3">
                      <div className="h-3 w-24 animate-pulse bg-[var(--surface-container-high)]" />

                      <div className="h-3 w-32 animate-pulse bg-[var(--surface-container-high)]" />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Error */}
          {!loading && errorMessage && (
            <div className="border border-[var(--border)] py-20 text-center">
              <p className="font-[var(--font-newsreader)] text-2xl">
                Something went wrong.
              </p>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadPosts}
                className="mt-5 border border-[var(--foreground)] px-5 py-2 text-xs font-semibold"
              >
                Try again
              </button>
            </div>
          )}

          {/* Posts */}
          {!loading &&
            !errorMessage &&
            filteredPosts.length > 0 && (
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
                {filteredPosts.map((post) => {
                  const profile = getProfile(
                    post.profiles,
                  );

                  const username =
                    profile?.username ??
                    "user";

                  const displayName =
                    profile?.display_name ??
                    username;

                  return (
                    <article
                      key={post.id}
                      className="group mb-5 break-inside-avoid"
                    >
                      <Link
                        href={`/post/${post.id}`}
                        className="block"
                      >
                        <div className="relative overflow-hidden bg-[var(--surface-container)]">
                          <img
                            src={post.image_url}
                            alt={
                              post.caption ??
                              `${username} post`
                            }
                            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                          />
                        </div>
                      </Link>

                      <div className="flex items-start justify-between gap-4 pt-3">
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${encodeURIComponent(
                              username,
                            )}`}
                            className="block truncate text-sm font-semibold hover:underline"
                          >
                            {username}
                          </Link>

                          {post.caption && (
                            <Link
                              href={`/post/${post.id}`}
                              className="mt-1 block text-xs leading-5 text-[var(--muted)]"
                            >
                              {post.caption}
                            </Link>
                          )}

                          <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--muted)]">
                            <span>
                              {displayName}
                            </span>

                            {post.location && (
                              <>
                                <span>·</span>

                                <span>
                                  {post.location}
                                </span>
                              </>
                            )}

                            <span>·</span>

                            <span>
                              {formatTime(
                                post.created_at,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          {/* Empty */}
          {!loading &&
            !errorMessage &&
            filteredPosts.length === 0 && (
              <div className="border border-[var(--border)] py-20 text-center">
                <p className="font-[var(--font-newsreader)] text-2xl">
                  {search
                    ? "No posts found."
                    : "Nothing here yet."}
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  {search
                    ? "Try a different search."
                    : "Create the first post on Picly."}
                </p>

                {!search && (
                  <Link
                    href="/create"
                    className="mt-5 inline-flex border border-[var(--foreground)] px-5 py-2 text-xs font-semibold"
                  >
                    Create a post
                  </Link>
                )}
              </div>
            )}
        </section>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)] lg:hidden">
        <div className="grid h-16 grid-cols-5">
          <Link
            href="/home"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <Home
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Home
            </span>
          </Link>

          <Link
            href="/explore"
            className="flex flex-col items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <Compass
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-semibold">
              Explore
            </span>
          </Link>

          <Link
            href="/create"
            className="flex flex-col items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <Plus
              size={21}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Create
            </span>
          </Link>

          <Link
            href="/marketplace"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Market
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <User
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}