"use client";

import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Post = {
  id: number;
  username: string;
  name: string;
  location: string;
  avatar: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  time: string;
  isForSale?: boolean;
  productName?: string | null;
  price?: number | null;
  currency?: string | null;
  category?: string | null;
  condition?: string | null;
};

const currencySymbols: Record<string, string> = {
  TZS: "TSh",
  USD: "$",
  KES: "KSh",
  UGX: "USh",
  EUR: "€",
  GBP: "£",
};

export default function PostCard({ post }: { post: Post }) {
  const supabase = createClient();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [likeLoading, setLikeLoading] = useState(false);

  const [commentCount, setCommentCount] = useState(post.comments);

  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  useEffect(() => {
    checkLike();
    checkSave();
    loadComments();
    loadFollowState();
  }, [post.id, post.username]);

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  }

  async function checkLike() {
    const user = await getCurrentUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Like check failed:", error);
      return;
    }

    setLiked(Boolean(data));
  }

  async function checkSave() {
    const user = await getCurrentUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("saves")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Save check failed:", error);
      return;
    }

    setSaved(Boolean(data));
  }

  async function loadComments() {
    const { count, error } = await supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("post_id", post.id);

    if (error) {
      console.error("Comment count failed:", error);
      return;
    }

    setCommentCount(count ?? 0);
  }

  async function loadFollowState() {
    const user = await getCurrentUser();

    if (!user) return;

    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", post.username)
      .maybeSingle();

    if (profileError) {
      console.error("Follow profile lookup failed:", profileError);
      return;
    }

    if (!targetProfile) return;

    setTargetUserId(targetProfile.id);

    if (targetProfile.id === user.id) {
      setIsSelf(true);
      setFollowing(false);
      return;
    }

    setIsSelf(false);

    const { data: follow, error: followError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetProfile.id)
      .maybeSingle();

    if (followError) {
      console.error("Follow check failed:", followError);
      return;
    }

    setFollowing(Boolean(follow));
  }

  async function handleFollow() {
    if (followLoading || isSelf || !targetUserId) return;

    setFollowLoading(true);

    const user = await getCurrentUser();

    if (!user || targetUserId === user.id) {
      setFollowLoading(false);
      return;
    }

    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);

      if (error) {
        console.error("Unfollow failed:", error);
        setFollowLoading(false);
        return;
      }

      setFollowing(false);
    } else {
      const { error } = await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
      });

      if (error) {
        console.error("Follow failed:", error);
        setFollowLoading(false);
        return;
      }

      setFollowing(true);

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: targetUserId,
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

    setFollowLoading(false);
  }

  async function handleLike() {
    if (likeLoading) return;

    setLikeLoading(true);

    const user = await getCurrentUser();

    if (!user) {
      setLikeLoading(false);
      return;
    }

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Unlike failed:", error);
        setLikeLoading(false);
        return;
      }

      setLiked(false);
      setLikeCount((value) => Math.max(0, value - 1));
    } else {
      const { error } = await supabase.from("likes").insert({
        post_id: post.id,
        user_id: user.id,
      });

      if (error) {
        console.error("Like failed:", error);
        setLikeLoading(false);
        return;
      }

      setLiked(true);
      setLikeCount((value) => value + 1);

      const { data: postOwner, error: ownerError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", post.id)
        .maybeSingle();

      if (ownerError) {
        console.error("Post owner lookup failed:", ownerError);
      } else if (postOwner && postOwner.user_id !== user.id) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            recipient_id: postOwner.user_id,
            actor_id: user.id,
            type: "like",
            post_id: post.id,
          });

        if (notificationError) {
          console.error(
            "Like notification failed:",
            notificationError,
          );
        }
      }
    }

    setLikeLoading(false);
  }

  async function handleSave() {
    if (saveLoading) return;

    setSaveLoading(true);

    const user = await getCurrentUser();

    if (!user) {
      setSaveLoading(false);
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("saves")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Unsave failed:", error);
        setSaveLoading(false);
        return;
      }

      setSaved(false);
    } else {
      const { error } = await supabase.from("saves").insert({
        post_id: post.id,
        user_id: user.id,
      });

      if (error) {
        console.error("Save failed:", error);
        setSaveLoading(false);
        return;
      }

      setSaved(true);
    }

    setSaveLoading(false);
  }

  function formatPrice() {
    if (post.price === null || post.price === undefined) {
      return "Price not set";
    }

    const currency = post.currency || "TZS";
    const symbol = currencySymbols[currency] || currency;

    return `${symbol} ${post.price.toLocaleString("en-US")}`;
  }

  const profileHref = `/profile/${encodeURIComponent(post.username)}`;

  const productHref = `/marketplace/${post.id}`;

  const imageHref = post.isForSale
    ? productHref
    : `/post/${post.id}`;

  return (
    <article
      className={
        "border-b pb-10 " +
        (post.isForSale
          ? "border-[var(--secondary)]/30"
          : "border-[var(--border)]")
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={profileHref} className="shrink-0">
            <img
              src={post.avatar}
              alt={post.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={profileHref}
                className="truncate text-sm font-semibold hover:opacity-60"
              >
                {post.username}
              </Link>

              {isSelf ? (
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--secondary)] sm:block">
                  You
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followLoading || !targetUserId}
                  className={
                    "hidden text-xs font-semibold sm:block disabled:opacity-50 " +
                    (following
                      ? "text-[var(--muted)]"
                      : "text-[var(--secondary)]")
                  }
                >
                  {followLoading
                    ? "..."
                    : following
                      ? "Following"
                      : "Follow"}
                </button>
              )}
            </div>

            <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
              {post.location}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="More options"
          className="ml-3 shrink-0 text-[var(--muted)]"
        >
          <MoreHorizontal size={20} strokeWidth={1.7} />
        </button>
      </div>

      {post.isForSale && isSelf && (
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--border)]" />

          <div className="flex items-center gap-2 px-1">
            <ShoppingBag
              size={14}
              strokeWidth={1.8}
              className="text-[var(--secondary)]"
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
              Your listing
            </span>
          </div>

          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
      )}

      <Link
        href={imageHref}
        aria-label={
          post.isForSale
            ? isSelf
              ? `View your listing for ${
                  post.productName || "this item"
                }`
              : `View ${post.productName || "this item"}`
            : `Open post by ${post.username}`
        }
        className="group relative block overflow-hidden rounded-lg bg-[var(--surface-container)]"
      >
        <img
          src={post.image}
          alt={post.caption}
          className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
        />

        {post.isForSale && (
          <>
            <div className="absolute left-4 top-4 flex items-center gap-2 border border-[var(--foreground)]/10 bg-[var(--background)] px-3 py-2">
              <ShoppingBag
                size={14}
                strokeWidth={1.8}
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                {isSelf ? "Your listing" : "For sale"}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border border-white/20 bg-[var(--background)]/95 px-4 py-3 transition-transform duration-300 group-hover:-translate-y-0.5">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--secondary)]">
                  {isSelf ? "Listed by you" : "Product"}
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold">
                  {post.productName || "Item for sale"}
                </p>
              </div>

              <span className="ml-3 shrink-0 text-xs font-semibold">
                {isSelf ? "View listing →" : "View item →"}
              </span>
            </div>
          </>
        )}
      </Link>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            aria-label={liked ? "Unlike post" : "Like post"}
            className={
              "flex items-center gap-1.5 text-sm disabled:opacity-50 " +
              (liked
                ? "text-[var(--secondary)]"
                : "text-[var(--foreground)]")
            }
          >
            <Heart
              size={20}
              strokeWidth={1.7}
              fill={liked ? "currentColor" : "none"}
            />

            <span>{likeCount}</span>
          </button>

          <Link
            href={`/post/${post.id}`}
            aria-label="Comments"
            className="flex items-center gap-1.5 text-sm"
          >
            <MessageCircle
              size={20}
              strokeWidth={1.7}
            />

            <span>{commentCount}</span>
          </Link>

          <button
            type="button"
            aria-label="Share"
            className="text-[var(--foreground)] hover:opacity-60"
          >
            <Send size={19} strokeWidth={1.7} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveLoading}
          aria-label={saved ? "Remove bookmark" : "Save post"}
          className="text-[var(--foreground)] hover:opacity-60 disabled:opacity-50"
        >
          <Bookmark
            size={20}
            strokeWidth={1.7}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="mt-3">
        <p className="text-sm leading-6">
          <Link
            href={profileHref}
            className="mr-2 font-semibold hover:opacity-60"
          >
            {post.username}
          </Link>

          {post.caption}
        </p>

        <p className="mt-2 text-xs text-[var(--muted)]">
          {post.time}
        </p>
      </div>

      {post.isForSale && post.productName && (
        <div
          className={
            "mt-5 border bg-[var(--surface-container-low)] " +
            (isSelf
              ? "border-[var(--secondary)]/40"
              : "border-[var(--border)]")
          }
        >
          <div className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <ShoppingBag
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--secondary)]"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--secondary)]">
                  {isSelf
                    ? "Your marketplace listing"
                    : "Marketplace item"}
                </span>
              </div>

              <p className="text-base font-semibold">
                {post.productName}
              </p>

              {(post.category || post.condition) && (
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
                  {post.category && (
                    <span>{post.category}</span>
                  )}

                  {post.category && post.condition && (
                    <span>·</span>
                  )}

                  {post.condition && (
                    <span>{post.condition}</span>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-base font-bold">
                {formatPrice()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-[var(--border)]">
            <Link
              href={productHref}
              className="flex items-center justify-center border-r border-[var(--border)] px-4 py-3 text-xs font-semibold transition-colors hover:bg-[var(--surface-container)]"
            >
              View listing
            </Link>

            {isSelf ? (
              <Link
                href={`/create?edit=${post.id}`}
                className="flex items-center justify-center px-4 py-3 text-xs font-semibold text-[var(--secondary)] transition-colors hover:bg-[var(--surface-container)]"
              >
                Edit listing
              </Link>
            ) : (
              <Link
                href={`/messages/${encodeURIComponent(
                  post.username,
                )}?post=${post.id}`}
                className="flex items-center justify-center px-4 py-3 text-xs font-semibold text-[var(--secondary)] transition-colors hover:bg-[var(--surface-container)]"
              >
                Message seller
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}