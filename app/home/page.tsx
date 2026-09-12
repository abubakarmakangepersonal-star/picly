
"use client";

import {
  Bell,
  Compass,
  Home as HomeIcon,
  Plus,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import FeedTabs from "@/app/components/feed/FeedTabs";
import PostCard, {
  type Post,
} from "@/app/components/feed/PostCard";
import { createClient } from "@/lib/supabase/client";

type FeedTab = "forYou" | "following";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
};

type SupabasePost = {
  id: number;
  user_id: string;
  image_url: string;
  caption: string | null;
  location: string | null;
  created_at: string;

  // Marketplace fields
  is_for_sale: boolean;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  condition: string | null;

  profiles: Profile | Profile[] | null;
};

type LikeRow = {
  post_id: number;
};

function formatTime(dateString: string) {
  const created = new Date(dateString);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const now = new Date();

  let seconds = Math.floor(
    (now.getTime() - created.getTime()) / 1000,
  );

  if (seconds < 0) {
    seconds = 0;
  }

  if (seconds < 60) {
    return "Just now";
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
    created.getFullYear() === now.getFullYear();

  if (sameYear) {
    return created.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return created.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createFairFeed(posts: SupabasePost[]) {
  const result: SupabasePost[] = [];
  const creatorCounts = new Map<string, number>();

  let lastCreator: string | null = null;

  const remaining = [...posts];

  while (remaining.length > 0) {
    let selectedIndex = -1;

    for (let index = 0; index < remaining.length; index++) {
      const post = remaining[index];

      const count =
        creatorCounts.get(post.user_id) ?? 0;

      if (
        post.user_id !== lastCreator &&
        count < 2
      ) {
        selectedIndex = index;
        break;
      }
    }

    if (selectedIndex === -1) {
      for (
        let index = 0;
        index < remaining.length;
        index++
      ) {
        const post = remaining[index];

        const count =
          creatorCounts.get(post.user_id) ?? 0;

        if (count < 2) {
          selectedIndex = index;
          break;
        }
      }
    }

    if (selectedIndex === -1) {
      break;
    }

    const [selected] =
      remaining.splice(selectedIndex, 1);

    result.push(selected);

    creatorCounts.set(
      selected.user_id,
      (creatorCounts.get(selected.user_id) ?? 0) + 1,
    );

    lastCreator = selected.user_id;
  }

  return result;
}

export default function HomePage() {
  const [activeTab, setActiveTab] =
    useState<FeedTab>("forYou");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "You need to be signed in to view your feed.",
        );
        setLoading(false);
        return;
      }

      let followingIds: string[] = [];

      if (activeTab === "following") {
        const {
          data: follows,
          error: followsError,
        } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        if (followsError) {
          console.error(
            "Error loading following list:",
            followsError,
          );

          setError(
            "Unable to load your following feed.",
          );
          setLoading(false);
          return;
        }

        followingIds = (follows ?? []).map(
          (follow) => follow.following_id,
        );

        if (followingIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      let postsQuery = supabase
        .from("posts")
        .select(`
          id,
          user_id,
          image_url,
          caption,
          location,
          created_at,
          is_for_sale,
          product_name,
          price,
          currency,
          category,
          condition,
          profiles (
            id,
            username,
            display_name,
            avatar_url,
            location
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (activeTab === "following") {
        postsQuery = postsQuery.in(
          "user_id",
          followingIds,
        );
      }

      const {
        data,
        error: postsError,
      } = await postsQuery;

      if (postsError) {
        console.error(
          "Error loading posts:",
          postsError,
        );

        setError("Unable to load posts.");
        setLoading(false);
        return;
      }

      const realPosts = createFairFeed(
        (data ?? []) as SupabasePost[],
      );

      const postIds = realPosts.map(
        (post) => post.id,
      );

      let likes: LikeRow[] = [];

      if (postIds.length > 0) {
        const {
          data: likesData,
          error: likesError,
        } = await supabase
          .from("likes")
          .select("post_id")
          .in("post_id", postIds);

        if (likesError) {
          console.error(
            "Error loading likes:",
            likesError,
          );

          setError(
            "Unable to load post likes.",
          );
          setLoading(false);
          return;
        }

        likes = (likesData ?? []) as LikeRow[];
      }

      const likeCounts = new Map<number, number>();

      for (const like of likes) {
        likeCounts.set(
          like.post_id,
          (likeCounts.get(like.post_id) ?? 0) + 1,
        );
      }

      const formattedPosts: Post[] =
        realPosts.map((post) => {
          const profile = Array.isArray(
            post.profiles,
          )
            ? post.profiles[0]
            : post.profiles;

          return {
            id: post.id,

            username:
              profile?.username ?? "unknown",

            name:
              profile?.display_name ??
              profile?.username ??
              "Picly user",

            location:
              post.location ??
              profile?.location ??
              "",

            avatar:
              profile?.avatar_url ??
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",

            image: post.image_url,

            likes:
              likeCounts.get(post.id) ?? 0,

            comments: 0,

            caption:
              post.caption ?? "",

            time: formatTime(
              post.created_at,
            ),

            // Marketplace data
            isForSale:
              post.is_for_sale ?? false,

            productName:
              post.product_name,

            price:
              post.price,

            currency:
              post.currency ?? "TZS",

            category:
              post.category,

            condition:
              post.condition,
          };
        });

      setPosts(formattedPosts);
      setLoading(false);
    }

    loadPosts();
  }, [activeTab]);

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
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <HomeIcon
                size={17}
                strokeWidth={1.8}
              />
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
              className="text-[var(--foreground)] transition-opacity hover:opacity-60"
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
              className="text-[var(--foreground)] transition-opacity hover:opacity-60"
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
          <button
            type="button"
            aria-label="Search"
            className="text-[var(--foreground)]"
          >
            <Search
              size={19}
              strokeWidth={1.8}
            />
          </button>

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

      {/* Main content */}
      <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <section className="mx-auto max-w-2xl">
          <div className="flex items-end justify-between border-b border-[var(--border)] py-7">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--secondary)]">
                {activeTab === "forYou"
                  ? "Your visual feed"
                  : "People you follow"}
              </p>

              <h1 className="font-[var(--font-newsreader)] text-3xl tracking-tight sm:text-4xl">
                {activeTab === "forYou"
                  ? "Discover what catches your eye."
                  : "See what they are sharing."}
              </h1>
            </div>
          </div>

          <FeedTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="space-y-10 pt-8">
            {loading && (
              <div className="py-16 text-center text-sm text-[var(--muted)]">
                Loading your feed...
              </div>
            )}

            {!loading && error && (
              <div className="border border-[var(--border)] px-5 py-6 text-center">
                <p className="text-sm text-[var(--foreground)]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 border border-[var(--foreground)] px-4 py-2 text-sm font-semibold"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              posts.length === 0 &&
              activeTab === "forYou" && (
                <div className="py-16 text-center">
                  <p className="font-[var(--font-newsreader)] text-2xl">
                    Nothing here yet.
                  </p>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Be the first person to share
                    something.
                  </p>

                  <Link
                    href="/create"
                    className="mt-6 inline-flex items-center gap-2 border border-[var(--foreground)] px-5 py-3 text-sm font-semibold"
                  >
                    <Plus size={17} />
                    Create a post
                  </Link>
                </div>
              )}

            {!loading &&
              !error &&
              posts.length === 0 &&
              activeTab === "following" && (
                <div className="py-16 text-center">
                  <p className="font-[var(--font-newsreader)] text-2xl">
                    Your following feed is quiet.
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                    Follow a few people to see
                    their photos and discoveries
                    here.
                  </p>

                  <Link
                    href="/explore"
                    className="mt-6 inline-flex items-center gap-2 border border-[var(--foreground)] px-5 py-3 text-sm font-semibold"
                  >
                    <Compass size={17} />
                    Discover people
                  </Link>
                </div>
              )}

            {!loading &&
              !error &&
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                />
              ))}
          </div>
        </section>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)] lg:hidden">
        <div className="grid h-16 grid-cols-5">
          <Link
            href="/home"
            className="flex flex-col items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <HomeIcon
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-semibold">
              Home
            </span>
          </Link>

          <Link
            href="/explore"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <Compass
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
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