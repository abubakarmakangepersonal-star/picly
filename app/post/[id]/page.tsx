"use client";

import {
  ArrowLeft,
  Bell,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
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

type Comment = {
  id: number;
  user_id: string;
  post_id: number;
  content: string;
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

export default function PostDetailPage() {
  const params = useParams();
  const supabase = createClient();

  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(postId)) {
      setLoading(false);
      return;
    }

    loadPost();
  }, [postId]);

  async function loadPost() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);

    const { data: postData, error: postError } =
      await supabase
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
            avatar_url,
            location
          )
        `)
        .eq("id", postId)
        .single();

    if (postError) {
      console.error("Error loading post:", postError);
      setLoading(false);
      return;
    }

    const loadedPost = postData as Post;

    setPost(loadedPost);

    const { data: commentData, error: commentError } =
      await supabase
        .from("comments")
        .select(`
          id,
          user_id,
          post_id,
          content,
          created_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url,
            location
          )
        `)
        .eq("post_id", postId)
        .order("created_at", {
          ascending: true,
        });

    if (commentError) {
      console.error(
        "Error loading comments:",
        commentError,
      );
    } else {
      setComments(
        (commentData ?? []) as Comment[],
      );
    }

    const { data: likesData, error: likesError } =
      await supabase
        .from("likes")
        .select("id, user_id")
        .eq("post_id", postId);

    if (likesError) {
      console.error(
        "Error loading likes:",
        likesError,
      );
    } else {
      setLikeCount(likesData?.length ?? 0);

      if (user) {
        setLiked(
          likesData?.some(
            (like) => like.user_id === user.id,
          ) ?? false,
        );
      }
    }

    if (user) {
      const { data: saveData, error: saveError } =
        await supabase
          .from("saves")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (saveError) {
        console.error(
          "Error loading save:",
          saveError,
        );
      } else {
        setSaved(Boolean(saveData));
      }

      if (loadedPost.user_id !== user.id) {
        const {
          data: followData,
          error: followError,
        } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq(
            "following_id",
            loadedPost.user_id,
          )
          .maybeSingle();

        if (followError) {
          console.error(
            "Error loading follow state:",
            followError,
          );
        } else {
          setFollowing(Boolean(followData));
        }
      }
    }

    setLoading(false);
  }

  async function handleLike() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !post) {
      return;
    }

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        console.error(
          "Error removing like:",
          error,
        );
        return;
      }

      setLiked(false);
      setLikeCount((count) =>
        Math.max(0, count - 1),
      );

      return;
    }

    const { error } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) {
      console.error(
        "Error adding like:",
        error,
      );
      return;
    }

    setLiked(true);
    setLikeCount((count) => count + 1);

    if (post.user_id !== user.id) {
      const {
        error: notificationError,
      } = await supabase
        .from("notifications")
        .insert({
          recipient_id: post.user_id,
          actor_id: user.id,
          type: "like",
          post_id: postId,
        });

      if (notificationError) {
        console.error(
          "Like notification failed:",
          notificationError,
        );
      }
    }
  }

  async function handleFollow() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !post) {
      return;
    }

    if (post.user_id === user.id) {
      return;
    }

    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq(
          "following_id",
          post.user_id,
        );

      if (error) {
        console.error(
          "Error unfollowing:",
          error,
        );
        return;
      }

      setFollowing(false);

      return;
    }

    const { error } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: post.user_id,
      });

    if (error) {
      console.error(
        "Error following:",
        error,
      );
      return;
    }

    setFollowing(true);

    const {
      error: notificationError,
    } = await supabase
      .from("notifications")
      .insert({
        recipient_id: post.user_id,
        actor_id: user.id,
        type: "follow",
        post_id: null,
      });

    if (notificationError) {
      console.error(
        "Follow notification failed:",
        notificationError,
      );
    }
  }

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("saves")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        console.error(
          "Error removing save:",
          error,
        );
        return;
      }

      setSaved(false);

      return;
    }

    const { error } = await supabase
      .from("saves")
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (error) {
      console.error(
        "Error saving post:",
        error,
      );
      return;
    }

    setSaved(true);
  }

  async function handleComment(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const text = comment.trim();

    if (!text || commentLoading) {
      return;
    }

    setCommentLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCommentLoading(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: text,
      })
      .select(`
        id,
        user_id,
        post_id,
        content,
        created_at,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          location
        )
      `)
      .single();

    if (error) {
      console.error(
        "Error posting comment:",
        error,
      );
      setCommentLoading(false);
      return;
    }

    setComments((current) => [
      ...current,
      data as Comment,
    ]);

    setComment("");

    if (post && post.user_id !== user.id) {
      const {
        error: notificationError,
      } = await supabase
        .from("notifications")
        .insert({
          recipient_id: post.user_id,
          actor_id: user.id,
          type: "comment",
          post_id: postId,
        });

      if (notificationError) {
        console.error(
          "Comment notification failed:",
          notificationError,
        );
      }
    }

    setCommentLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <p className="text-sm text-[var(--muted)]">
            Loading post...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4">
          <h1 className="font-[var(--font-newsreader)] text-3xl">
            Post not found
          </h1>

          <Link
            href="/home"
            className="mt-4 text-sm font-semibold text-[var(--secondary)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const creator = getProfile(post.profiles);

  const username =
    creator?.username ?? "user";

  const displayName =
    creator?.display_name ?? username;

  const location =
    post.location ??
    creator?.location ??
    "";

  const avatar =
    creator?.avatar_url ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";

  const isOwnPost =
    currentUserId === post.user_id;

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
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
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
              className="hover:opacity-60"
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
              className="hover:opacity-60"
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
          aria-label="Back to home"
          className="flex items-center gap-2"
        >
          <ArrowLeft
            size={19}
            strokeWidth={1.8}
          />

          <span className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight">
            Picly
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="text-[var(--muted)]"
          >
            <Bell
              size={20}
              strokeWidth={1.7}
            />
          </Link>

          <button
            type="button"
            aria-label="More options"
            className="text-[var(--muted)]"
          >
            <MoreHorizontal
              size={20}
              strokeWidth={1.7}
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-12 lg:py-10">
          {/* Image */}
          <section>
            <div className="relative overflow-hidden bg-[var(--surface-container)]">
              <img
                src={post.image_url}
                alt={
                  post.caption ??
                  "Picly post"
                }
                className="w-full object-cover"
              />
            </div>
          </section>

          {/* Details */}
          <section className="flex flex-col">
            {/* Creator */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
              <Link
                href={`/profile/${encodeURIComponent(
                  username,
                )}`}
                className="flex items-center gap-3"
              >
                <img
                  src={avatar}
                  alt={`${displayName} profile`}
                  className="h-10 w-10 rounded-full object-cover"
                />

                <div>
                  <p className="text-sm font-semibold">
                    {username}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {location}
                  </p>
                </div>
              </Link>

              {!isOwnPost && (
                <button
                  type="button"
                  onClick={handleFollow}
                  className={`border px-4 py-2 text-xs font-semibold transition-colors ${
                    following
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : "border-[var(--border)] hover:border-[var(--foreground)]"
                  }`}
                >
                  {following
                    ? "Following"
                    : "Follow"}
                </button>
              )}
            </div>

            {/* Caption */}
            <div className="border-b border-[var(--border)] py-6">
              <p className="text-base leading-7">
                <Link
                  href={`/profile/${encodeURIComponent(
                    username,
                  )}`}
                  className="mr-2 font-semibold"
                >
                  {username}
                </Link>

                {post.caption}
              </p>

              <p className="mt-3 text-xs text-[var(--muted)]">
                {formatTime(
                  post.created_at,
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-b border-[var(--border)] py-5">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={handleLike}
                  aria-label={
                    liked
                      ? "Unlike post"
                      : "Like post"
                  }
                  className={`flex items-center gap-1.5 text-sm ${
                    liked
                      ? "text-[var(--secondary)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  <Heart
                    size={21}
                    strokeWidth={1.7}
                    fill={
                      liked
                        ? "currentColor"
                        : "none"
                    }
                  />

                  <span>{likeCount}</span>
                </button>

                <div className="flex items-center gap-1.5 text-sm">
                  <MessageCircle
                    size={21}
                    strokeWidth={1.7}
                  />

                  <span>
                    {comments.length}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label="Share post"
                  className="hover:opacity-60"
                >
                  <Send
                    size={20}
                    strokeWidth={1.7}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSave}
                aria-label={
                  saved
                    ? "Remove bookmark"
                    : "Save post"
                }
                className="hover:opacity-60"
              >
                <Bookmark
                  size={21}
                  strokeWidth={1.7}
                  fill={
                    saved
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            {/* Comments */}
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-newsreader)] text-2xl tracking-tight">
                  Comments
                </h2>

                <span className="text-xs text-[var(--muted)]">
                  {comments.length}
                </span>
              </div>

              <div className="mt-5 space-y-5">
                {comments.length === 0 ? (
                  <p className="py-4 text-sm text-[var(--muted)]">
                    No comments yet. Be the
                    first to comment.
                  </p>
                ) : (
                  comments.map((item) => {
                    const commenter =
                      getProfile(
                        item.profiles,
                      );

                    const commenterUsername =
                      commenter?.username ??
                      "user";

                    const commenterAvatar =
                      commenter?.avatar_url ||
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80";

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3"
                      >
                        <Link
                          href={`/profile/${encodeURIComponent(
                            commenterUsername,
                          )}`}
                        >
                          <img
                            src={
                              commenterAvatar
                            }
                            alt={`${commenterUsername} profile`}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        </Link>

                        <div className="min-w-0">
                          <p className="text-sm leading-6">
                            <Link
                              href={`/profile/${encodeURIComponent(
                                commenterUsername,
                              )}`}
                              className="mr-2 font-semibold"
                            >
                              {
                                commenterUsername
                              }
                            </Link>

                            {
                              item.content
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-[var(--muted)]">
                            {formatTime(
                              item.created_at,
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment input */}
              <form
                onSubmit={handleComment}
                className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-5"
              >
                <input
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value,
                    )
                  }
                  type="text"
                  maxLength={500}
                  placeholder="Add a comment..."
                  disabled={
                    commentLoading
                  }
                  className="h-11 min-w-0 flex-1 border border-[var(--border)] bg-transparent px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={
                    !comment.trim() ||
                    commentLoading
                  }
                  className="h-11 px-4 text-sm font-semibold text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {commentLoading
                    ? "Posting..."
                    : "Post"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}