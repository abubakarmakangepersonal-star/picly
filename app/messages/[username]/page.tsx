"use client";

import {
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Send,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
};

type Product = {
  id: number;
  image_url: string;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  condition: string | null;
  is_for_sale: boolean;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

const currencySymbols: Record<string, string> = {
  TZS: "TSh",
  USD: "$",
  KES: "KSh",
  UGX: "USh",
  EUR: "€",
  GBP: "£",
};

function formatPrice(
  price: number | null,
  currency: string | null,
) {
  if (price === null) {
    return "Price not set";
  }

  const code = currency || "TZS";
  const symbol = currencySymbols[code] || code;

  return `${symbol} ${price.toLocaleString("en-US", {
    minimumFractionDigits:
      code === "TZS" || code === "KES" || code === "UGX" ? 0 : 2,
    maximumFractionDigits:
      code === "TZS" || code === "KES" || code === "UGX" ? 0 : 2,
  })}`;
}

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageSellerPage() {
  const supabase = createClient();

  const params = useParams();
  const searchParams = useSearchParams();

  const username = decodeURIComponent(String(params.username));
  const postId = searchParams.get("post");
  const conversationParam = searchParams.get("conversation");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const markMessagesAsRead = useCallback(
    async (id: number, userId: string) => {
      const { error: readError } = await supabase
        .from("messages")
        .update({
          is_read: true,
        })
        .eq("conversation_id", id)
        .neq("sender_id", userId)
        .eq("is_read", false);

      if (readError) {
        console.error(
          "Mark messages as read failed:",
          readError,
        );
      }
    },
    [supabase],
  );

  const loadMessages = useCallback(
    async (id: number, userId?: string) => {
      const { data, error: messagesError } = await supabase
        .from("messages")
        .select(
          "id, conversation_id, sender_id, content, created_at, is_read",
        )
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Messages load failed:", messagesError);
        return;
      }

      setMessages(data ?? []);

      if (userId) {
        await markMessagesAsRead(id, userId);
      }
    },
    [markMessagesAsRead, supabase],
  );

  const loadConversation = useCallback(
    async (
      userId: string,
      sellerId: string,
    ) => {
      let existingConversation = null;

      if (conversationParam) {
        const numericConversationId = Number(
          conversationParam,
        );

        if (!Number.isNaN(numericConversationId)) {
          const { data, error: conversationError } =
            await supabase
              .from("conversations")
              .select(
                "id, buyer_id, seller_id, post_id, updated_at",
              )
              .eq("id", numericConversationId)
              .or(
                `and(buyer_id.eq.${userId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${userId})`,
              )
              .maybeSingle();

          if (conversationError) {
            console.error(
              "Conversation lookup failed:",
              conversationError,
            );
          } else {
            existingConversation = data;
          }
        }
      }

      if (!existingConversation) {
        const { data, error: conversationError } =
          await supabase
            .from("conversations")
            .select(
              "id, buyer_id, seller_id, post_id, updated_at",
            )
            .or(
              `and(buyer_id.eq.${userId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${userId})`,
            )
            .order("updated_at", { ascending: false })
            .limit(1);

        if (conversationError) {
          console.error(
            "Conversation lookup failed:",
            conversationError,
          );
          return null;
        }

        existingConversation = data?.[0] ?? null;
      }

      if (!existingConversation) {
        return null;
      }

      setConversationId(existingConversation.id);

      await loadMessages(
        existingConversation.id,
        userId,
      );

      return existingConversation.id;
    },
    [
      conversationParam,
      loadMessages,
      supabase,
    ],
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          `/messages/${username}${
            postId
              ? `?post=${postId}`
              : conversationParam
                ? `?conversation=${conversationParam}`
                : ""
          }`,
        )}`;
        return;
      }

      setCurrentUserId(user.id);

      const { data: sellerData, error: sellerError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url, bio, location",
          )
          .eq("username", username)
          .maybeSingle();

      if (sellerError) {
        console.error(
          "Seller lookup failed:",
          sellerError,
        );

        setError("Unable to load this seller.");
        setLoading(false);
        return;
      }

      if (!sellerData) {
        setError("Seller not found.");
        setLoading(false);
        return;
      }

      if (sellerData.id === user.id) {
        setError("You cannot message yourself.");
        setLoading(false);
        return;
      }

      setSeller(sellerData);

      if (postId) {
        const numericPostId = Number(postId);

        if (!Number.isNaN(numericPostId)) {
          const {
            data: productData,
            error: productError,
          } = await supabase
            .from("posts")
            .select(
              "id, image_url, product_name, price, currency, category, condition, is_for_sale",
            )
            .eq("id", numericPostId)
            .eq("user_id", sellerData.id)
            .maybeSingle();

          if (productError) {
            console.error(
              "Product lookup failed:",
              productError,
            );
          } else if (productData) {
            setProduct(productData);
          }
        }
      }

      await loadConversation(
        user.id,
        sellerData.id,
      );

      if (active) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [
    conversationParam,
    loadConversation,
    postId,
    supabase,
    username,
  ]);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    const interval = window.setInterval(async () => {
      await loadMessages(
        conversationId,
        currentUserId,
      );
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    conversationId,
    currentUserId,
    loadMessages,
  ]);

  async function createConversation() {
    if (!currentUserId || !seller) {
      return null;
    }

    const { data, error: createError } =
      await supabase
        .from("conversations")
        .insert({
          buyer_id: currentUserId,
          seller_id: seller.id,
          post_id: product?.id ?? null,
        })
        .select(
          "id, buyer_id, seller_id, post_id, updated_at",
        )
        .single();

    if (createError) {
      console.error(
        "Conversation creation failed:",
        createError,
      );

      setError(
        createError.message ||
          "Unable to start this conversation.",
      );

      return null;
    }

    setConversationId(data.id);

    return data.id;
  }

  async function handleSend(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !currentUserId ||
      !seller ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      activeConversationId =
        await createConversation();
    }

    if (!activeConversationId) {
      setSending(false);
      return;
    }

    const {
      data: newMessage,
      error: messageError,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id:
          activeConversationId,
        sender_id: currentUserId,
        content: trimmedMessage,
      })
      .select(
        "id, conversation_id, sender_id, content, created_at, is_read",
      )
      .single();

    if (messageError) {
      console.error(
        "Message send failed:",
        messageError,
      );

      setError(
        messageError.message ||
          "Unable to send message.",
      );

      setSending(false);
      return;
    }

    if (newMessage) {
      setMessages((currentMessages) => [
        ...currentMessages,
        newMessage,
      ]);
    }

    await supabase
      .from("conversations")
      .update({
        updated_at:
          newMessage?.created_at ??
          new Date().toISOString(),
      })
      .eq("id", activeConversationId);

    setMessage("");
    setSending(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Loader2
          size={22}
          strokeWidth={1.7}
          className="animate-spin text-[var(--muted)]"
        />
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)]">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
            <Link
              href="/messages"
              aria-label="Back to messages"
              className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
            >
              <ArrowLeft
                size={20}
                strokeWidth={1.7}
              />
            </Link>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-[var(--font-newsreader)] text-2xl">
              {error || "Seller not found"}
            </h1>

            <Link
              href="/messages"
              className="mt-4 inline-block text-sm underline underline-offset-4"
            >
              Back to messages
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/messages"
              aria-label="Back to messages"
              className="flex h-9 w-9 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
            >
              <ArrowLeft
                size={20}
                strokeWidth={1.7}
              />
            </Link>

            <Link
              href={`/profile/${encodeURIComponent(
                seller.username,
              )}`}
              className="flex min-w-0 items-center gap-3"
            >
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt={`${seller.display_name || seller.username} profile`}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-container)] text-sm font-semibold">
                  {(
                    seller.display_name ||
                    seller.username ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  @{seller.username}
                </p>

                <p className="truncate text-xs text-[var(--muted)]">
                  {seller.display_name ||
                    "Picly user"}
                </p>
              </div>
            </Link>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <MoreHorizontal
              size={21}
              strokeWidth={1.7}
            />
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col">
        <section className="flex-1 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              {seller.avatar_url ? (
                <img
                  src={seller.avatar_url}
                  alt={`${seller.display_name || seller.username} profile`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-container)] text-xl font-semibold">
                  {(
                    seller.display_name ||
                    seller.username ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <h1 className="mt-4 font-[var(--font-newsreader)] text-2xl">
                {seller.display_name ||
                  seller.username}
              </h1>

              <p className="mt-1 text-xs text-[var(--muted)]">
                @{seller.username}
                {seller.location
                  ? ` · ${seller.location}`
                  : ""}
              </p>
            </div>

            {product && product.is_for_sale && (
              <Link
                href={`/marketplace/${product.id}`}
                className="mb-8 flex items-center gap-4 border border-[var(--border)] bg-[var(--surface-container-low)] p-3 transition-colors hover:bg-[var(--surface-container)]"
              >
                <img
                  src={product.image_url}
                  alt={
                    product.product_name ||
                    "Marketplace item"
                  }
                  className="h-16 w-16 shrink-0 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag
                      size={14}
                      strokeWidth={1.7}
                      className="shrink-0 text-[var(--secondary)]"
                    />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      Marketplace item
                    </p>
                  </div>

                  <p className="mt-1 truncate text-sm font-semibold">
                    {product.product_name ||
                      "Marketplace item"}
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {formatPrice(
                      product.price,
                      product.currency,
                    )}
                  </p>
                </div>
              </Link>
            )}

            {messages.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-[var(--font-newsreader)] text-xl">
                  Start the conversation
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Send a message to{" "}
                  {seller.display_name ||
                    seller.username}
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((item) => {
                  const mine =
                    item.sender_id ===
                    currentUserId;

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        mine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-3 ${
                          mine
                            ? "bg-[var(--foreground)] text-[var(--background)]"
                            : "border border-[var(--border)] bg-[var(--surface-container-low)]"
                        }`}
                      >
                        <p className="text-sm leading-6">
                          {item.content}
                        </p>

                        <p
                          className={`mt-1.5 text-[10px] ${
                            mine
                              ? "text-[var(--background)]/60"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {formatMessageTime(
                            item.created_at,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--background)] px-4 py-4 sm:px-6">
          <form
            onSubmit={handleSend}
            className="mx-auto flex max-w-xl items-center gap-3"
          >
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              disabled={sending}
              placeholder="Write a message..."
              className="h-11 min-w-0 flex-1 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                sending || !message.trim()
              }
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--foreground)] text-[var(--background)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? (
                <Loader2
                  size={18}
                  strokeWidth={1.7}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={18}
                  strokeWidth={1.7}
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}