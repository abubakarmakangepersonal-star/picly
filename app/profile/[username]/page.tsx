"use client";

import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Grid3X3,
  Link as LinkIcon,
  MapPin,
  MoreHorizontal,
  UserPlus,
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
  website: string | null;
  created_at: string;
};

type Post = {
  id: number;
  image_url: string;
  caption: string | null;
  location: string | null;
  created_at: string;
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getUsername() {
      const resolvedParams = await params;
      setUsername(decodeURIComponent(resolvedParams.username));
    }

    getUsername();
  }, [params]);

  useEffect(() => {
    if (!username) return;

    loadProfile(username);
  }, [username]);

  async function loadProfile(profileUsername: string) {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user?.id ?? null);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, location, website, created_at",
      )
      .eq("username", profileUsername)
      .maybeSingle();

    if (profileError) {
      console.error("Profile loading failed:", profileError);
      setError("Unable to load this profile.");
      setLoading(false);
      return;
    }

    if (!profileData) {
      setError("Profile not found.");
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: postData, error: postsError } = await supabase
      .from("posts")
      .select("id, image_url, caption, location, created_at")
      .eq("user_id", profileData.id)
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Posts loading failed:", postsError);
    }

    setPosts(postData ?? []);

    const { count: followers } = await supabase
      .from("follows")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("following_id", profileData.id);

    const { count: following } = await supabase
      .from("follows")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("follower_id", profileData.id);

    setFollowersCount(followers ?? 0);
    setFollowingCount(following ?? 0);

    if (user && user.id !== profileData.id) {
      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", profileData.id)
        .maybeSingle();

      if (followError) {
        console.error("Follow status failed:", followError);
      }

      setIsFollowing(Boolean(followData));
    } else {
      setIsFollowing(false);
    }

    setLoading(false);
  }

  async function handleFollow() {
    if (!profile || !currentUser || followLoading) return;

    setFollowLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser)
        .eq("following_id", profile.id);

      if (error) {
        console.error("Unfollow failed:", error);
        setFollowLoading(false);
        return;
      }

      setIsFollowing(false);
      setFollowersCount((count) => Math.max(0, count - 1));
    } else {
      const { error } = await supabase.from("follows").insert({
        follower_id: currentUser,
        following_id: profile.id,
      });

      if (error) {
        console.error("Follow failed:", error);
        setFollowLoading(false);
        return;
      }

      setIsFollowing(true);
      setFollowersCount((count) => count + 1);
    }

    setFollowLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-container)]" />

          <div className="mt-10 flex flex-col items-center">
            <div className="h-28 w-28 animate-pulse rounded-full bg-[var(--surface-container)]" />

            <div className="mt-5 h-6 w-40 animate-pulse bg-[var(--surface-container)]" />

            <div className="mt-3 h-4 w-24 animate-pulse bg-[var(--surface-container)]" />
          </div>
        </div>
      </main>
    );
  }

  if (!profile || error) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
          <h1 className="font-[var(--font-newsreader)] text-4xl">
            Profile not found
          </h1>

          <p className="mt-3 text-sm text-[var(--muted)]">
            This profile does not exist or is unavailable.
          </p>

          <Link
            href="/home"
            className="mt-7 inline-flex items-center gap-2 border border-[var(--border)] px-5 py-3 text-sm font-semibold hover:opacity-60"
          >
            <ArrowLeft size={16} strokeWidth={1.7} />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUser === profile.id;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-60"
          >
            <ArrowLeft size={18} strokeWidth={1.7} />
            <span>Back</span>
          </Link>

          <Link
            href="/home"
            className="font-[var(--font-newsreader)] text-2xl"
          >
            Picly
          </Link>

          <button
            type="button"
            aria-label="More options"
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <MoreHorizontal size={20} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      {/* Profile information */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="h-28 w-28 overflow-hidden rounded-full bg-[var(--surface-container)] md:h-32 md:w-32">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                {(profile.display_name || profile.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="mt-6 font-[var(--font-newsreader)] text-4xl md:text-5xl">
            {profile.display_name || profile.username}
          </h1>

          {/* Username */}
          <p className="mt-2 text-sm text-[var(--muted)]">
            @{profile.username}
          </p>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-5 max-w-xl text-sm leading-7">
              {profile.bio}
            </p>
          )}

          {/* Meta */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted)]">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={1.7} />
                {profile.location}
              </span>
            )}

            {profile.website && (
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--foreground)]"
              >
                <LinkIcon size={14} strokeWidth={1.7} />
                Website
              </a>
            )}

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} strokeWidth={1.7} />
              Joined {formatDate(profile.created_at)}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-8 flex items-center gap-8">
            <div className="text-center">
              <p className="text-lg font-semibold">{posts.length}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Posts</p>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold">{followersCount}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Followers
              </p>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold">{followingCount}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Following
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="mt-8">
            {isOwnProfile ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 border border-[var(--border)] px-6 py-3 text-sm font-semibold hover:opacity-60"
              >
                <Edit3 size={16} strokeWidth={1.7} />
                Edit profile
              </Link>
            ) : currentUser ? (
              <button
                type="button"
                onClick={handleFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold disabled:opacity-50 ${
                  isFollowing
                    ? "border border-[var(--border)] bg-transparent text-[var(--foreground)]"
                    : "bg-[var(--primary)] text-[var(--background)]"
                }`}
              >
                <UserPlus size={16} strokeWidth={1.7} />

                {followLoading
                  ? "Please wait..."
                  : isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-[var(--background)]"
              >
                <UserPlus size={16} strokeWidth={1.7} />
                Follow
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="mx-auto max-w-5xl border-t border-[var(--border)]">
        <div className="flex items-center justify-center border-b border-[var(--border)] py-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
            <Grid3X3 size={15} strokeWidth={1.7} />
            Posts
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <h2 className="font-[var(--font-newsreader)] text-3xl">
              No posts yet
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Posts shared by this user will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-[var(--border)] md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group relative aspect-square overflow-hidden bg-[var(--surface-container)]"
              >
                <img
                  src={post.image_url}
                  alt={post.caption || "Picly post"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

                {post.caption && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/70 px-4 py-3 text-left text-white transition-transform duration-300 group-hover:translate-y-0">
                    <p className="line-clamp-2 text-xs">
                      {post.caption}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}