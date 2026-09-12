
"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  MoreHorizontal,
  Send,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Product = {
  id: number;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  condition: string | null;
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
  if (price === null || price === undefined) {
    return "";
  }

  const symbol =
    currencySymbols[currency || "TZS"] ||
    currency ||
    "TSh";

  return `${symbol} ${price.toLocaleString()}`;
}

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageUserPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const username = decodeURIComponent(
    String(params.username),
  );

  const postIdParam = searchParams.get("post");
  const conversationParam =
    searchParams.get("conversation");

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [conversationId, setConversationId] =
    useState<number | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const currentProfileInitial = useMemo(() => {
    return (
      profile?.display_name?.charAt(0) ||
      profile?.username?.charAt(0) ||
      "U"
    ).toUpperCase();
  }, [profile]);

  /*
   * Get logged-in user
   */
  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        setError(
          "You must be logged in to send messages.",
        );
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Load target profile
   */
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      const { data, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, display_name, avatar_url",
          )
          .eq("username", username)
          .maybeSingle();

      if (!mounted) {
        return;
      }

      if (profileError) {
        console.error(
          "Profile load failed:",
          profileError,
        );
        setError("Unable to load this user.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("User not found.");
        setLoading(false);
        return;
      }

      if (data.id === currentUserId) {
        setError("You cannot message yourself.");
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [currentUserId, username]);

  /*
   * Load product when coming from:
   * /messages/username?post=123
   */
  useEffect(() => {
    if (!postIdParam) {
      setProduct(null);
      return;
    }

    const postId = Number(postIdParam);

    if (!Number.isFinite(postId)) {
      setProduct(null);
      return;
    }

    let mounted = true;

    async function loadProduct() {
      const { data, error: productError } =
        await supabase
          .from("posts")
          .select(
            `
            id,
            product_name,
            price,
            currency,
            image_url,
            condition
          `,
          )
          .eq("id", postId)
          .eq("is_for_sale", true)
          .maybeSingle();

      if (!mounted) {
        return;
      }

      if (productError) {
        console.error(
          "Product load failed:",
          productError,
        );
        setProduct(null);
        return;
      }

      setProduct(data as Product | null);
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [postIdParam]);

  /*
   * Find or create conversation
   */
  useEffect(() => {
    if (!currentUserId || !profile) {
      return;
    }

    /*
     * Capture these values before entering the async
     * function so TypeScript knows they cannot become null.
     */
    const userId = currentUserId;
    const targetProfileId = profile.id;

    let mounted = true;

    async function findConversation() {
      setError(null);

      /*
       * If the URL already contains a conversation ID,
       * verify that both users are participants.
       */
      if (conversationParam) {
        const requestedConversationId =
          Number(conversationParam);

        if (Number.isFinite(requestedConversationId)) {
          const {
            data,
            error: conversationError,
          } = await supabase
            .from("conversations")
            .select(
              "id, buyer_id, seller_id, post_id",
            )
            .eq("id", requestedConversationId)
            .maybeSingle();

          if (!mounted) {
            return;
          }

          if (conversationError) {
            console.error(
              "Conversation lookup failed:",
              conversationError,
            );
          } else if (
            data &&
            (data.buyer_id === userId ||
              data.seller_id === userId) &&
            (data.buyer_id === targetProfileId ||
              data.seller_id === targetProfileId)
          ) {
            setConversationId(data.id);
            return;
          }
        }
      }

      /*
       * Find an existing conversation between the
       * logged-in user and target user in either direction.
       */
      const {
        data,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, buyer_id, seller_id, post_id, updated_at",
        )
        .or(
          `and(buyer_id.eq.${userId},seller_id.eq.${targetProfileId}),and(buyer_id.eq.${targetProfileId},seller_id.eq.${userId})`,
        )
        .order("updated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (conversationError) {
        console.error(
          "Conversation lookup failed:",
          conversationError,
        );
        setConversationId(null);
        return;
      }

      if (data) {
        setConversationId(data.id);
        return;
      }

      /*
       * No conversation exists.
       *
       * If there is no listing context, create a normal
       * conversation between the two users.
       */
      if (!product && !postIdParam) {
        const {
          data: newConversation,
          error: createError,
        } = await supabase
          .from("conversations")
          .insert({
            buyer_id: userId,
            seller_id: targetProfileId,
            post_id: null,
          })
          .select("id")
          .single();

        if (!mounted) {
          return;
        }

        if (createError) {
          console.error(
            "Conversation creation failed:",
            createError,
          );
          setError(
            "Unable to start this conversation.",
          );
          return;
        }

        setConversationId(newConversation.id);
        return;
      }

      /*
       * Product conversation.
       */
      const {
        data: newConversation,
        error: createError,
      } = await supabase
        .from("conversations")
        .insert({
          buyer_id: userId,
          seller_id: targetProfileId,
          post_id:
            product?.id ?? Number(postIdParam),
        })
        .select("id")
        .single();

      if (!mounted) {
        return;
      }

      if (createError) {
        console.error(
          "Conversation creation failed:",
          createError,
        );

        /*
         * Another request may have created the
         * conversation at the same time.
         */
        const {
          data: existingConversation,
        } = await supabase
          .from("conversations")
          .select("id")
          .or(
            `and(buyer_id.eq.${userId},seller_id.eq.${targetProfileId}),and(buyer_id.eq.${targetProfileId},seller_id.eq.${userId})`,
          )
          .order("updated_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (!mounted) {
          return;
        }

        if (existingConversation) {
          setConversationId(
            existingConversation.id,
          );
          return;
        }

        setError(
          "Unable to start this conversation.",
        );
        return;
      }

      setConversationId(newConversation.id);
    }

    findConversation();

    return () => {
      mounted = false;
    };
  }, [
    currentUserId,
    profile,
    product,
    postIdParam,
    conversationParam,
  ]);

  /*
   * Load messages
   */
  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    async function loadMessages() {
      setMessagesLoading(true);

      const {
        data,
        error: messagesError,
      } = await supabase
        .from("messages")
        .select(
          `
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          is_read
        `,
        )
        .eq(
          "conversation_id",
          conversationId,
        )
        .order("created_at", {
          ascending: true,
        });

      if (!mounted) {
        return;
      }

      if (messagesError) {
        console.error(
          "Messages load failed:",
          messagesError,
        );
        setMessagesLoading(false);
        return;
      }

      setMessages(
        (data || []) as Message[],
      );

      setMessagesLoading(false);
    }

    loadMessages();

    /*
     * Poll every three seconds so messages from
     * another user appear without refreshing.
     */
    const interval = window.setInterval(
      loadMessages,
      3000,
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [conversationId, currentUserId]);

  /*
   * Mark incoming messages as read
   */
  useEffect(() => {
    if (
      !conversationId ||
      !currentUserId ||
      messages.length === 0
    ) {
      return;
    }

    const unreadIds = messages
      .filter(
        (message) =>
          message.sender_id !== currentUserId &&
          !message.is_read,
      )
      .map((message) => message.id);

    if (unreadIds.length === 0) {
      return;
    }

    async function markMessagesRead() {
      const { error: updateError } =
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unreadIds)
          .eq(
            "conversation_id",
            conversationId,
          );

      if (updateError) {
        console.error(
          "Mark messages read failed:",
          updateError,
        );
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          unreadIds.includes(message.id)
            ? {
                ...message,
                is_read: true,
              }
            : message,
        ),
      );
    }

    markMessagesRead();
  }, [
    conversationId,
    currentUserId,
    messages,
  ]);

  /*
   * Send message
   */
  async function handleSend() {
    const content = messageText.trim();

    if (!content) {
      return;
    }

    if (!currentUserId || !profile) {
      return;
    }

    if (currentUserId === profile.id) {
      setError(
        "You cannot message yourself.",
      );
      return;
    }

    if (!conversationId) {
      setError(
        "Conversation is not ready yet.",
      );
      return;
    }

    setSending(true);
    setError(null);

    const {
      data: insertedMessage,
      error: sendError,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      })
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        is_read
      `,
      )
      .single();

    if (sendError) {
      console.error(
        "Send message failed:",
        sendError,
      );
      setError(
        "Message could not be sent.",
      );
      setSending(false);
      return;
    }

    /*
     * Update the conversation timestamp so the inbox
     * moves the conversation to the top.
     */
    const {
      error: conversationUpdateError,
    } = await supabase
      .from("conversations")
      .update({
        updated_at:
          insertedMessage.created_at,
      })
      .eq("id", conversationId);

    if (conversationUpdateError) {
      console.error(
        "Conversation update failed:",
        conversationUpdateError,
      );
    }

    setMessages((current) => [
      ...current,
      insertedMessage as Message,
    ]);

    setMessageText("");
    setSending(false);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!sending) {
        handleSend();
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-3xl">
          <div className="h-6 w-32 animate-pulse bg-[var(--surface-container)]" />

          <div className="mt-6 h-16 animate-pulse bg-[var(--surface-container)]" />
        </div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={18} />
            Back to messages
          </Link>

          <div className="mt-10 border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h1 className="font-[var(--font-newsreader)] text-3xl">
              {error}
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!profile || !currentUserId) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={19} />
            Messages
          </Link>

          <Link
            href={`/profile/${encodeURIComponent(
              profile.username,
            )}`}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-container)] text-sm font-semibold">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={
                    profile.display_name ||
                    profile.username
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                currentProfileInitial
              )}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold">
                {profile.display_name ||
                  profile.username}
              </p>

              <p className="text-xs text-[var(--muted)]">
                @{profile.username}
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="More options"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Chat */}
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <div className="flex-1 px-4 py-6">
          {/* Profile */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href={`/profile/${encodeURIComponent(
                profile.username,
              )}`}
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-container)] text-lg font-semibold"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={
                    profile.display_name ||
                    profile.username
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                currentProfileInitial
              )}
            </Link>

            <h1 className="mt-3 font-[var(--font-newsreader)] text-2xl">
              {profile.display_name ||
                profile.username}
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              @{profile.username}
            </p>
          </div>

          {/* Product context */}
          {product && (
            <Link
              href={`/marketplace/${product.id}`}
              className="mb-6 flex items-center gap-3 border border-[var(--border)] bg-[var(--surface)] p-3 transition hover:border-[var(--foreground)]"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[var(--surface-container)]">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={
                      product.product_name ||
                      "Product"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBag
                    size={22}
                    className="text-[var(--muted)]"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  About this listing
                </p>

                <p className="mt-1 truncate text-sm font-semibold">
                  {product.product_name ||
                    "Marketplace item"}
                </p>

                {product.price !== null && (
                  <p className="mt-1 text-sm text-[var(--secondary)]">
                    {formatPrice(
                      product.price,
                      product.currency,
                    )}
                  </p>
                )}
              </div>

              <ShoppingBag
                size={18}
                className="shrink-0 text-[var(--muted)]"
              />
            </Link>
          )}

          {/* Messages */}
          <div className="space-y-3">
            {messagesLoading &&
            messages.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--muted)]">
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-[var(--font-newsreader)] text-2xl">
                  Start the conversation
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Send a message to{" "}
                  {profile.display_name ||
                    profile.username}.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine =
                  message.sender_id ===
                  currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[65%] ${
                        isMine
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "border border-[var(--border)] bg-[var(--surface)]"
                      } px-4 py-3`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.content}
                      </p>

                      <p
                        className={`mt-1 text-[10px] ${
                          isMine
                            ? "text-[var(--background)]/60"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {formatMessageTime(
                          message.created_at,
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Error */}
        {error && profile && (
          <div className="px-4 pb-2">
            <p className="text-center text-xs text-[var(--error)]">
              {error}
            </p>
          </div>
        )}

        {/* Composer */}
        <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--background)] px-4 py-3">
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Add image"
            >
              <ImageIcon size={20} />
            </button>

            <textarea
              value={messageText}
              onChange={(event) =>
                setMessageText(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={`Message @${profile.username}`}
              rows={1}
              className="max-h-32 min-h-11 flex-1 resize-none border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                sending ||
                !messageText.trim()
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--foreground)] text-[var(--background)] transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
            Press Enter to send · Shift + Enter
            for a new line
          </p>
        </div>
      </section>
    </main>
  );
}
