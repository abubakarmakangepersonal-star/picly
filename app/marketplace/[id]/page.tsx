
"use client";

import {
  ArrowLeft,
  Bell,
  Home,
  MessageCircle,
  Plus,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MarketplaceProduct = {
  id: number;
  image_url: string;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  listing_location: string | null;
  caption: string | null;
  user_id: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  }[];
};

const currencySymbols: Record<string, string> = {
  TZS: "TSh",
  USD: "$",
  KES: "KSh",
  UGX: "USh",
  EUR: "€",
  GBP: "£",
};

export default function MarketplaceProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] =
    useState<MarketplaceProduct | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  async function loadProduct() {
    setLoading(true);
    setError("");

    const productId = Number(params.id);

    if (!Number.isInteger(productId)) {
      setError("Invalid marketplace item.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: productError } =
      await supabase
        .from("posts")
        .select(`
          id,
          image_url,
          product_name,
          price,
          currency,
          category,
          condition,
          location,
          listing_location,
          caption,
          user_id,
          profiles (
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq("id", productId)
        .eq("is_for_sale", true)
        .single();

    if (productError) {
      console.error(
        "Marketplace product loading failed:",
        productError,
      );

      setError("This marketplace item could not be found.");
      setProduct(null);
      setLoading(false);
      return;
    }

    setProduct(data as MarketplaceProduct);
    setLoading(false);
  }

  function formatPrice(
    price: number | null,
    currency: string | null,
  ) {
    if (price === null || Number.isNaN(price)) {
      return "Price not set";
    }

    const symbol =
      currencySymbols[currency || "TZS"] ||
      currency ||
      "TSh";

    const isWholeNumber =
      currency === "TZS" ||
      currency === "UGX" ||
      currency === "KES";

    return `${symbol} ${price.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: isWholeNumber
          ? 0
          : 2,
        maximumFractionDigits: isWholeNumber
          ? 0
          : 2,
      },
    )}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-12">
          <div className="h-8 w-24 animate-pulse bg-[var(--surface-container)]" />

          <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="aspect-[4/5] animate-pulse bg-[var(--surface-container)] md:aspect-[4/3]" />

            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse bg-[var(--surface-container)]" />
              <div className="h-8 w-1/3 animate-pulse bg-[var(--surface-container)]" />
              <div className="h-24 w-full animate-pulse bg-[var(--surface-container)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-4 text-center">
          <ShoppingBag
            size={32}
            strokeWidth={1.5}
            className="text-[var(--muted)]"
          />

          <h1 className="mt-5 font-[family-name:var(--font-newsreader)] text-3xl font-semibold">
            Item unavailable
          </h1>

          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            {error || "This marketplace item is no longer available."}
          </p>

          <Link
            href="/marketplace"
            className="mt-6 inline-flex items-center gap-2 bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)]"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  const seller = product.profiles?.[0];

  const productLocation =
    product.listing_location ||
    product.location;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)] md:pb-0">
      {/* Desktop Header */}
      <header className="sticky top-0 z-30 hidden border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <Link
            href="/home"
            className="font-[family-name:var(--font-newsreader)] text-3xl font-semibold tracking-tight"
          >
            Picly
          </Link>

          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link
              href="/home"
              className="flex items-center gap-2 hover:opacity-60"
            >
              <Home size={17} strokeWidth={1.8} />
              Home
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center gap-2 font-semibold"
            >
              <ShoppingBag size={17} strokeWidth={1.8} />
              Marketplace
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/create"
              aria-label="Create post"
              className="hover:opacity-60"
            >
              <Plus size={20} strokeWidth={1.8} />
            </Link>

            <Link
              href="/notifications"
              aria-label="Notifications"
              className="hover:opacity-60"
            >
              <Bell size={19} strokeWidth={1.8} />
            </Link>

            <Link
              href="/profile"
              aria-label="My profile"
              className="hover:opacity-60"
            >
              <User size={19} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="border-b border-[var(--border)] md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
            Marketplace
          </Link>

          <Link
            href="/profile"
            aria-label="My profile"
            className="hover:opacity-60"
          >
            <User size={20} strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      {/* Product */}
      <section className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-12">
        <Link
          href="/marketplace"
          className="mb-8 hidden w-fit items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] md:inline-flex"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to marketplace
        </Link>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] md:gap-12">
          {/* Image */}
          <div className="relative overflow-hidden bg-[var(--surface-container)]">
            <img
              src={product.image_url}
              alt={
                product.product_name ||
                "Marketplace item"
              }
              className="h-auto max-h-[760px] w-full object-cover"
            />

            {product.condition && (
              <span className="absolute left-4 top-4 bg-[var(--background)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                {product.condition}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div>
              {product.category && (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
                  {product.category}
                </p>
              )}

              <h1 className="font-[family-name:var(--font-newsreader)] text-4xl font-semibold tracking-tight md:text-5xl">
                {product.product_name ||
                  "Untitled item"}
              </h1>

              <p className="mt-4 text-2xl font-semibold">
                {formatPrice(
                  product.price,
                  product.currency,
                )}
              </p>
            </div>

            {/* Seller */}
            {seller && (
              <div className="mt-8 border-y border-[var(--border)] py-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Listed by
                </p>

                <Link
                  href={`/profile/${encodeURIComponent(
                    seller.username,
                  )}`}
                  className="flex items-center gap-3"
                >
                  {seller.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={
                        seller.display_name ||
                        seller.username
                      }
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-container)] text-sm font-semibold">
                      {seller.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold">
                      {seller.display_name ||
                        seller.username}
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      @{seller.username}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Description */}
            {product.caption && (
              <div className="mt-7">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Description
                </p>

                <p className="text-sm leading-7 text-[var(--muted)]">
                  {product.caption}
                </p>
              </div>
            )}

            {/* Location */}
            {productLocation && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Location
                </p>

                <p className="text-sm">
                  {productLocation}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8">
              {seller && (
                <Link
                  href={`/messages/${encodeURIComponent(
                    seller.username,
                  )}?post=${product.id}`}
                  className="flex w-full items-center justify-center gap-2 bg-[var(--foreground)] px-5 py-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-85"
                >
                  <MessageCircle
                    size={18}
                    strokeWidth={1.8}
                  />
                  Message seller
                </Link>
              )}

              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="mt-3 flex w-full items-center justify-center border border-[var(--border)] px-5 py-4 text-sm font-semibold hover:bg-[var(--surface-container-low)]"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)] md:hidden">
        <div className="grid h-16 grid-cols-5">
          <Link
            href="/home"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <Home size={19} strokeWidth={1.8} />
            <span className="text-[10px]">
              Home
            </span>
          </Link>

          <Link
            href="/marketplace"
            className="flex flex-col items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px]">
              Market
            </span>
          </Link>

          <Link
            href="/create"
            className="flex flex-col items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <Plus size={21} strokeWidth={1.8} />
            <span className="text-[10px]">
              Create
            </span>
          </Link>

          <Link
            href="/notifications"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <Bell size={19} strokeWidth={1.8} />
            <span className="text-[10px]">
              Alerts
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <User size={19} strokeWidth={1.8} />
            <span className="text-[10px]">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
