"use client";

import {
  ArrowLeft,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Post = {
  product_name: string | null;
  image_url: string | null;
};

type MessagePreview = {
  content: string;
  created_at: string;
};

type Conversation = {
  id: number;
  buyer_id: string;
  seller_id: string;
  post_id: number | null;
  updated_at: string;
  seller: Profile | Profile[] | null;
  buyer: Profile | Profile[] | null;
  post: Post | Post[] | null;
  latestMessage: MessagePreview | null;
  unreadCount: number;
};

function getRelation<T>(
  value: T | T[] | null,
): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
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
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function MessagesPage() {
  const [userId, setUserId] =
    useState<string | null>(null);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error || !user) {
        setErrorMessage(
          "Please log in to view your messages.",
        );
        setLoading(false);
        return;
      }

      setUserId(user.id);

      await loadConversations(user.id);

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    const interval = window.setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      await loadConversations(user.id);
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  async function loadConversations(
    currentUserId?: string,
  ) {
    const activeUserId =
      currentUserId ?? userId;

    if (!activeUserId) {
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        buyer_id,
        seller_id,
        post_id,
        updated_at,

        seller:profiles!conversations_seller_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),

        buyer:profiles!conversations_buyer_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),

        post:posts!conversations_post_id_fkey (
          product_name,
          image_url
        )
      `)
      .or(
        `buyer_id.eq.${activeUserId},seller_id.eq.${activeUserId}`,
      )
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Conversations load failed:",
        error,
      );

      setErrorMessage(
        error.message ||
          "Unable to load your conversations.",
      );

      return;
    }

    const rows =
      (data ?? []) as Omit<
        Conversation,
        "latestMessage" | "unreadCount"
      >[];

    const rowsWithMessages =
      await Promise.all(
        rows.map(async (conversation) => {
          const [
            latestMessageResult,
            unreadResult,
          ] = await Promise.all([
            supabase
              .from("messages")
              .select(
                "content, created_at",
              )
              .eq(
                "conversation_id",
                conversation.id,
              )
              .order("created_at", {
                ascending: false,
              })
              .limit(1)
              .maybeSingle(),

            supabase
              .from("messages")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq(
                "conversation_id",
                conversation.id,
              )
              .eq("is_read", false)
              .neq("sender_id", activeUserId),
          ]);

          if (latestMessageResult.error) {
            console.error(
              `Latest message load failed for conversation ${conversation.id}:`,
              latestMessageResult.error,
            );
          }

          if (unreadResult.error) {
            console.error(
              `Unread message count failed for conversation ${conversation.id}:`,
              unreadResult.error,
            );
          }

          return {
            ...conversation,
            latestMessage:
              latestMessageResult.data ?? null,
            unreadCount:
              unreadResult.count ?? 0,
          };
        }),
      );

    const sorted =
      rowsWithMessages.sort(
        (a, b) => {
          // Unread conversations come first.
          if (
            a.unreadCount > 0 &&
            b.unreadCount === 0
          ) {
            return -1;
          }

          if (
            a.unreadCount === 0 &&
            b.unreadCount > 0
          ) {
            return 1;
          }

          const aDate =
            a.latestMessage?.created_at ??
            a.updated_at;

          const bDate =
            b.latestMessage?.created_at ??
            b.updated_at;

          return (
            new Date(bDate).getTime() -
            new Date(aDate).getTime()
          );
        },
      );

    setConversations(sorted);
    setErrorMessage("");
  }

  const filteredConversations =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const seller = getRelation(
            conversation.seller,
          );

          const buyer = getRelation(
            conversation.buyer,
          );

          const post = getRelation(
            conversation.post,
          );

          const otherUser =
            conversation.buyer_id === userId
              ? seller
              : buyer;

          if (!otherUser) {
            return false;
          }

          const username =
            otherUser.username.toLowerCase();

          const displayName = (
            otherUser.display_name ?? ""
          ).toLowerCase();

          const productName = (
            post?.product_name ?? ""
          ).toLowerCase();

          const latestMessage = (
            conversation.latestMessage
              ?.content ?? ""
          ).toLowerCase();

          return (
            username.includes(value) ||
            displayName.includes(value) ||
            productName.includes(value) ||
            latestMessage.includes(value)
          );
        },
      );
    }, [
      conversations,
      search,
      userId,
    ]);

  const unreadTotal = conversations.reduce(
    (total, conversation) =>
      total + conversation.unreadCount,
    0,
  );

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Link
            href="/home"
            aria-label="Back to home"
            className="mr-4 flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
          >
            <ArrowLeft
              size={20}
              strokeWidth={1.7}
            />
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="font-[var(--font-newsreader)] text-2xl">
              Messages
            </h1>

            {unreadTotal > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center bg-[var(--foreground)] px-1.5 text-[11px] font-semibold text-[var(--background)]">
                {unreadTotal > 99
                  ? "99+"
                  : unreadTotal}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-sm text-[var(--muted)]">
            Conversations with people on Picly.
          </p>
        </div>

        <div className="relative mb-6">
          <Search
            size={18}
            strokeWidth={1.7}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search messages..."
            className="h-12 w-full border border-[var(--border)] bg-[var(--surface-container-low)] pl-11 pr-4 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
          />
        </div>

        {loading && (
          <div className="border-t border-[var(--border)] py-16 text-center">
            <p className="text-sm text-[var(--muted)]">
              Loading messages...
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="border-t border-[var(--border)] py-16 text-center">
            <p className="font-[var(--font-newsreader)] text-2xl">
              Messages unavailable
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                loadConversations()
              }
              className="mt-6 border border-[var(--foreground)] px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          filteredConversations.length === 0 && (
            <div className="border-t border-[var(--border)] py-16 text-center">
              <p className="font-[var(--font-newsreader)] text-2xl">
                No conversations yet
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                Message a seller from a marketplace
                listing to start a conversation.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-flex border border-[var(--foreground)] px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
              >
                Browse marketplace
              </Link>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          filteredConversations.length > 0 && (
            <section className="border-t border-[var(--border)]">
              {filteredConversations.map(
                (conversation) => {
                  if (!userId) {
                    return null;
                  }

                  const seller = getRelation(
                    conversation.seller,
                  );

                  const buyer = getRelation(
                    conversation.buyer,
                  );

                  const post = getRelation(
                    conversation.post,
                  );

                  const otherUser =
                    conversation.buyer_id === userId
                      ? seller
                      : buyer;

                  if (
                    !otherUser ||
                    otherUser.id === userId
                  ) {
                    return null;
                  }

                  const username =
                    otherUser.username;

                  const displayName =
                    otherUser.display_name ||
                    username;

                  const messageDate =
                    conversation.latestMessage
                      ?.created_at ??
                    conversation.updated_at;

                  const isUnread =
                    conversation.unreadCount > 0;

                  return (
                    <Link
                      key={conversation.id}
                      href={`/messages/${encodeURIComponent(
                        username,
                      )}?conversation=${conversation.id}`}
                      className={`flex items-center gap-4 border-b border-[var(--border)] py-5 transition-colors hover:bg-[var(--surface-container-low)] ${
                        isUnread
                          ? "bg-[var(--surface-container-low)]"
                          : ""
                      }`}
                    >
                      {otherUser.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt={`${displayName} profile`}
                          className={`h-12 w-12 shrink-0 rounded-full object-cover ${
                            isUnread
                              ? "ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--background)]"
                              : ""
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container-high)] font-[var(--font-newsreader)] text-xl ${
                            isUnread
                              ? "ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--background)]"
                              : ""
                          }`}
                        >
                          {displayName
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-2">
                            <p
                              className={`truncate text-sm ${
                                isUnread
                                  ? "font-bold"
                                  : "font-semibold"
                              }`}
                            >
                              {username}
                            </p>

                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--secondary)]" />
                            )}
                          </div>

                          <span
                            className={`shrink-0 text-xs ${
                              isUnread
                                ? "font-semibold text-[var(--foreground)]"
                                : "text-[var(--muted)]"
                            }`}
                          >
                            {formatTime(
                              messageDate,
                            )}
                          </span>
                        </div>

                        {displayName !==
                          username && (
                          <p
                            className={`truncate text-xs ${
                              isUnread
                                ? "text-[var(--foreground)]"
                                : "text-[var(--muted)]"
                            }`}
                          >
                            {displayName}
                          </p>
                        )}

                        {post?.product_name && (
                          <div className="mt-2 flex items-center gap-2">
                            <ShoppingBag
                              size={13}
                              strokeWidth={1.7}
                              className="shrink-0 text-[var(--secondary)]"
                            />

                            <p className="truncate text-xs text-[var(--muted)]">
                              {post.product_name}
                            </p>
                          </div>
                        )}

                        {conversation.latestMessage ? (
                          <p
                            className={`mt-1 truncate text-sm ${
                              isUnread
                                ? "font-semibold text-[var(--foreground)]"
                                : "text-[var(--muted)]"
                            }`}
                          >
                            {conversation.latestMessage.content}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {isUnread && (
                        <span className="shrink-0 bg-[var(--foreground)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--background)]">
                          New
                        </span>
                      )}
                    </Link>
                  );
                },
              )}
            </section>
          )}
      </div>
    </main>
  );
}