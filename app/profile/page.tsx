"use client";

import {
  Bookmark,
  Grid3X3,
  Heart,
  Image as ImageIcon,
  MapPin,
  Settings,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
};

type UserPost = {
  id: number;
  image_url: string;
  caption: string | null;
  is_for_sale: boolean;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  condition: string | null;
};

const currencySymbols: Record<string, string> = {
  TZS: "TSh",
  USD: "$",
  KES: "KSh",
  UGX: "USh",
  EUR: "€",
  GBP: "£",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "posts" | "saved" | "marketplace"
  >("posts");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<UserPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to identify your account.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, location",
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
        setError("Unable to load your profile.");
        setLoading(false);
        return;
      }

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          "id, image_url, caption, is_for_sale, product_name, price, currency, condition",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error(postsError);
        setError(
          "Your profile loaded, but your posts could not be loaded.",
        );
        setProfile(profileData);
        setLoading(false);
        return;
      }

      const { data: savesData, error: savesError } = await supabase
        .from("saves")
        .select("post_id")
        .eq("user_id", user.id);

      if (savesError) {
        console.error("Saved posts failed:", savesError);
      }

      let savedPostsData: UserPost[] = [];

      if (savesData && savesData.length > 0) {
        const savedPostIds = savesData.map((save) => save.post_id);

        const { data: savedData, error: savedPostsError } = await supabase
          .from("posts")
          .select(
            "id, image_url, caption, is_for_sale, product_name, price, currency, condition",
          )
          .in("id", savedPostIds)
          .order("created_at", { ascending: false });

        if (savedPostsError) {
          console.error(
            "Saved post loading failed:",
            savedPostsError,
          );
        } else {
          savedPostsData = savedData ?? [];
        }
      }

      setProfile(profileData);
      setPosts(postsData ?? []);
      setSavedPosts(savedPostsData);
      setLoading(false);
    }

    loadProfile();
  }, []);

  function formatPrice(post: UserPost) {
    if (post.price === null || post.price === undefined) {
      return "";
    }

    const currency = post.currency || "TZS";
    const symbol = currencySymbols[currency] || currency;

    return `${symbol} ${post.price.toLocaleString("en-US")}`;
  }

  const listings = posts.filter((post) => post.is_for_sale);

  if (loading) {
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
          </div>
        </header>

        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
          <p className="text-sm text-[var(--muted)]">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
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
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="text-[var(--foreground)]"
            >
              <Settings size={21} strokeWidth={1.7} />
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted)]">
            {error || "Profile not found."}
          </p>

          <Link
            href="/home"
            className="mt-6 inline-flex border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
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

          <div className="flex items-center gap-5">
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="text-[var(--foreground)] transition-opacity hover:opacity-60"
            >
              <Settings size={21} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="border-b border-[var(--border)] pb-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5 sm:gap-7">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? profile.username}
                  className="h-24 w-24 rounded-full object-cover sm:h-32 sm:w-32"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--surface-container)] font-[var(--font-newsreader)] text-3xl sm:h-32 sm:w-32 sm:text-4xl">
                  {(profile.display_name ?? profile.username)
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="pt-1">
                <p className="text-sm font-semibold">
                  @{profile.username}
                </p>

                <h1 className="mt-1 font-[var(--font-newsreader)] text-3xl tracking-tight sm:text-4xl">
                  {profile.display_name || profile.username}
                </h1>

                {profile.location && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <MapPin size={14} strokeWidth={1.6} />
                    {profile.location}
                  </div>
                )}

                {profile.bio && (
                  <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="inline-flex items-center justify-center border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
            >
              Edit profile
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-8 border-t border-[var(--border)] pt-6">
            <Stat value={String(posts.length)} label="Posts" />
            <Stat value={String(listings.length)} label="Listings" />
            <Stat value="0" label="Followers" />
            <Stat value="0" label="Following" />
          </div>
        </section>

        <div className="mt-8 flex overflow-x-auto border-b border-[var(--border)]">
          <ProfileTab
            active={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
            icon={<Grid3X3 size={16} strokeWidth={1.7} />}
            label="Posts"
          />

          <ProfileTab
            active={activeTab === "saved"}
            onClick={() => setActiveTab("saved")}
            icon={<Bookmark size={16} strokeWidth={1.7} />}
            label="Saved"
          />

          <ProfileTab
            active={activeTab === "marketplace"}
            onClick={() => setActiveTab("marketplace")}
            icon={<ShoppingBag size={16} strokeWidth={1.7} />}
            label="Your listings"
          />
        </div>

        {activeTab === "posts" && (
          <PostGrid
            posts={posts}
            emptyTitle="No posts yet."
            emptyDescription="Share something and it will appear here."
            actionLabel="Create a post"
            actionHref="/create"
          />
        )}

        {activeTab === "saved" && (
          <section className="mt-6">
            {savedPosts.length === 0 ? (
              <div className="py-16 text-center">
                <Bookmark
                  size={28}
                  strokeWidth={1.5}
                  className="mx-auto text-[var(--muted)]"
                />

                <p className="mt-4 font-[var(--font-newsreader)] text-2xl">
                  Nothing saved yet.
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  Bookmark posts you want to come back to and they will
                  appear here.
                </p>

                <Link
                  href="/explore"
                  className="mt-6 inline-flex border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                >
                  Explore Picly
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                {savedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={
                      post.is_for_sale
                        ? `/marketplace/${post.id}`
                        : `/post/${post.id}`
                    }
                    className="group relative overflow-hidden bg-[var(--surface-container)]"
                  >
                    <img
                      src={post.image_url}
                      alt={
                        post.caption ||
                        post.product_name ||
                        "Saved post"
                      }
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    {post.is_for_sale && (
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        <ShoppingBag size={12} strokeWidth={1.7} />
                        Listing
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <div className="flex items-center gap-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          <Bookmark
                            size={17}
                            fill="currentColor"
                          />
                          Saved
                        </span>

                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          <ImageIcon size={17} />
                          View
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "marketplace" && (
          <section className="mt-6">
            {listings.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag
                  size={28}
                  strokeWidth={1.5}
                  className="mx-auto text-[var(--muted)]"
                />

                <p className="mt-4 font-[var(--font-newsreader)] text-2xl">
                  No listings yet.
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  When you list an item for sale, your marketplace
                  listings will appear here.
                </p>

                <Link
                  href="/create"
                  className="mt-6 inline-flex border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
                >
                  Create a listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                {listings.map((post) => (
                  <Link
                    key={post.id}
                    href={`/marketplace/${post.id}`}
                    className="group relative overflow-hidden bg-[var(--surface-container)]"
                  >
                    <img
                      src={post.image_url}
                      alt={
                        post.product_name || "Marketplace listing"
                      }
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                      <ShoppingBag size={12} strokeWidth={1.7} />
                      Your listing
                    </div>

                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[var(--background)] px-4 py-3 transition-transform duration-300 group-hover:translate-y-0">
                      <p className="truncate text-sm font-semibold">
                        {post.product_name || "Marketplace item"}
                      </p>

                      {post.price !== null && (
                        <p className="mt-1 text-sm font-semibold text-[var(--secondary)]">
                          {formatPrice(post)}
                        </p>
                      )}

                      {post.condition && (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {post.condition}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 border-t border-[var(--border)] pt-6">
          <p className="font-[var(--font-newsreader)] text-lg">
            Picly
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Share what you see.
          </p>
        </footer>
      </div>
    </main>
  );
}

function ProfileTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-4 pr-7 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
        active
          ? "border-[var(--foreground)] text-[var(--foreground)]"
          : "border-transparent text-[var(--muted)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PostGrid({
  posts,
  emptyTitle,
  emptyDescription,
  actionLabel,
  actionHref,
}: {
  posts: UserPost[];
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <section className="mt-6">
      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-[var(--font-newsreader)] text-2xl">
            {emptyTitle}
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {emptyDescription}
          </p>

          <Link
            href={actionHref}
            className="mt-6 inline-flex border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            {actionLabel}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={
                post.is_for_sale
                  ? `/marketplace/${post.id}`
                  : `/post/${post.id}`
              }
              className="group relative overflow-hidden bg-[var(--surface-container)]"
            >
              <img
                src={post.image_url}
                alt={post.caption || post.product_name || "Post"}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {post.is_for_sale && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                  <ShoppingBag size={12} strokeWidth={1.7} />
                  Listing
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <div className="flex items-center gap-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Heart size={17} fill="currentColor" />
                    View
                  </span>

                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <ImageIcon size={17} />
                    Open
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-sm font-bold">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}