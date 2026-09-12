"use client";

import Link from "next/link";
import { Bell, Check, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: number;
  type: "like" | "comment" | "follow";
  post_id: number | null;
  created_at: string;
  is_read: boolean;
  actor: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
};

export default function NotificationsPage() {
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        type,
        post_id,
        created_at,
        is_read,
        actor:profiles!notifications_actor_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notifications failed:", error);
      setLoading(false);
      return;
    }

    setNotifications((data ?? []) as unknown as Notification[]);
    setLoading(false);
  }

  async function markAsRead(id: number) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Mark notification failed:", error);
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Mark all notifications failed:", error);
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      })),
    );
  }

  function getMessage(notification: Notification) {
    const username = notification.actor?.username ?? "Someone";

    if (notification.type === "like") {
      return (
        <>
          <strong>{username}</strong> liked your post.
        </>
      );
    }

    if (notification.type === "comment") {
      return (
        <>
          <strong>{username}</strong> commented on your post.
        </>
      );
    }

    return (
      <>
        <strong>{username}</strong> started following you.
      </>
    );
  }

  function getIcon(type: Notification["type"]) {
    if (type === "like") {
      return <Heart size={18} strokeWidth={1.7} />;
    }

    if (type === "comment") {
      return <MessageCircle size={18} strokeWidth={1.7} />;
    }

    return <UserPlus size={18} strokeWidth={1.7} />;
  }

  function formatTime(date: string) {
    const difference = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/home" className="font-[var(--font-newsreader)] text-2xl">
            Picly
          </Link>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--secondary)] hover:opacity-60"
            >
              <Check size={15} strokeWidth={1.8} />
              Mark all as read
            </button>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Bell size={22} strokeWidth={1.7} />
            <h1 className="font-[var(--font-newsreader)] text-4xl">
              Notifications
            </h1>
          </div>

          {unreadCount > 0 && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {unreadCount} unread
            </p>
          )}
        </div>

        {loading ? (
          <div className="border-y border-[var(--border)]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 border-b border-[var(--border)] px-2 py-5 last:border-b-0"
              >
                <div className="h-10 w-10 rounded-full bg-[var(--surface-container)]" />
                <div className="flex-1">
                  <div className="h-3 w-48 bg-[var(--surface-container)]" />
                  <div className="mt-2 h-2 w-16 bg-[var(--surface-container)]" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="border-y border-[var(--border)] py-20 text-center">
            <Bell
              size={30}
              strokeWidth={1.4}
              className="mx-auto text-[var(--muted)]"
            />

            <h2 className="mt-5 font-[var(--font-newsreader)] text-2xl">
              Nothing here yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Likes, comments, and new followers will appear here.
            </p>
          </div>
        ) : (
          <div className="border-y border-[var(--border)]">
            {notifications.map((notification) => {
              const actor = notification.actor;

              const content = (
                <div className="flex items-center gap-4">
                  {actor?.avatar_url ? (
                    <img
                      src={actor.avatar_url}
                      alt={actor.username}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container)]">
                      <UserPlus size={17} strokeWidth={1.6} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6">
                      {getMessage(notification)}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>

                  <div
                    className={
                      "shrink-0 " +
                      (notification.type === "like"
                        ? "text-[var(--secondary)]"
                        : "text-[var(--muted)]")
                    }
                  >
                    {getIcon(notification.type)}
                  </div>

                  {!notification.is_read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--secondary)]" />
                  )}
                </div>
              );

              const href =
                notification.type === "follow" && actor
                  ? `/profile/${encodeURIComponent(actor.username)}`
                  : notification.post_id
                    ? `/post/${notification.post_id}`
                    : "#";

              return (
                <div
                  key={notification.id}
                  className={
                    "border-b border-[var(--border)] last:border-b-0 " +
                    (!notification.is_read
                      ? "bg-[var(--surface-container-low)]"
                      : "")
                  }
                >
                  <Link
                    href={href}
                    onClick={() => markAsRead(notification.id)}
                    className="block px-2 py-5 transition-opacity hover:opacity-70"
                  >
                    {content}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}