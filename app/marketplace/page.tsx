
"use client";

import {
  Bell,
  ChevronRight,
  Home,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MarketplacePost = {
  id: number;
  image_url: string;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  listing_location: string | null;
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

const categories = [
  "All",
  "Fashion",
  "Electronics",
  "Art",
  "Furniture",
  "Accessories",
  "Other",
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplacePost[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function loadMarketplace() {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: marketplaceError } = await supabase
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
        user_id,
        profiles (
          username,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq("is_for_sale", true)
      .order("created_at", { ascending: false });

    if (marketplaceError) {
      console.error(
        "Marketplace loading failed:",
        marketplaceError,
      );

      setError("Unable to load marketplace listings.");
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts((data as MarketplacePost[]) ?? []);
    setLoading(false);
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const seller = product.profiles?.[0];

      const sellerUsername =
        seller?.username?.toLowerCase() ?? "";

      const sellerName =
        seller?.display_name?.toLowerCase() ?? "";

      const productName =
        product.product_name?.toLowerCase() ?? "";

      const productCategory =
        product.category?.toLowerCase() ?? "";

      const productLocation = (
        product.listing_location ??
        product.location ??
        ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        productName.includes(query) ||
        sellerUsername.includes(query) ||
        sellerName.includes(query) ||
        productCategory.includes(query) ||
        productLocation.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

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

    return `${symbol} ${price.toLocaleString("en-US", {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: isWholeNumber ? 0 : 2,
    })}`;
  }

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
              href="/explore"
              className="flex items-center gap-2 hover:opacity-60"
            >
              <Search size={17} strokeWidth={1.8} />
              Explore
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
            href="/home"
            className="font-[family-name:var(--font-newsreader)] text-2xl font-semibold"
          >
            Picly
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/explore"
              aria-label="Search"
              className="hover:opacity-60"
            >
              <Search size={20} strokeWidth={1.8} />
            </Link>

            <Link
              href="/profile"
              aria-label="My profile"
              className="hover:opacity-60"
            >
              <User size={20} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="mx-auto max-w-[1400px] px-4 pb-7 pt-8 md:px-6 md:pb-10 md:pt-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
              Picly Marketplace
            </p>

            <h1 className="font-[family-name:var(--font-newsreader)] text-4xl font-semibold tracking-tight md:text-6xl">
              Things worth finding.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Discover objects shared by people in
              the Picly community.
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex w-fit items-center gap-2 bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} strokeWidth={1.8} />
            Sell an item
          </Link>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="flex flex-col gap-4 border-y border-[var(--border)] py-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={17}
              strokeWidth={1.8}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search marketplace"
              className="h-11 w-full border border-[var(--border)] bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
            />
          </div>

          <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(category)
                }
                className={`shrink-0 px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? "bg-[var(--primary)] text-white"
                    : "border border-[var(--border)] hover:bg-[var(--surface-container-low)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hidden shrink-0 items-center gap-2 border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-container-low)] lg:flex"
          >
            <SlidersHorizontal
              size={16}
              strokeWidth={1.8}
            />
            Filters
          </button>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-10">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">
            {loading
              ? "Loading..."
              : `${filteredProducts.length} ${
                  filteredProducts.length === 1
                    ? "item"
                    : "items"
                }`}
          </p>

          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium"
          >
            Latest
            <ChevronRight
              size={15}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="min-w-0"
                >
                  <div className="aspect-[4/5] animate-pulse bg-[var(--surface-container)]" />

                  <div className="space-y-2 pt-3">
                    <div className="h-4 w-3/4 animate-pulse bg-[var(--surface-container)]" />

                    <div className="h-4 w-1/3 animate-pulse bg-[var(--surface-container)]" />
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="border-y border-[var(--border)] py-24 text-center">
            <ShoppingBag
              size={30}
              strokeWidth={1.5}
              className="mx-auto text-[var(--muted)]"
            />

            <h2 className="mt-4 font-[family-name:var(--font-newsreader)] text-2xl font-semibold">
              Marketplace unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {error}
            </p>

            <button
              type="button"
              onClick={loadMarketplace}
              className="mt-5 text-sm font-semibold text-[var(--secondary)]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Products */}
        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
              {filteredProducts.map((product) => {
                const seller =
                  product.profiles?.[0];

                return (
                  <article
                    key={product.id}
                    className="group min-w-0"
                  >
                    <Link
                      href={`/marketplace/${product.id}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-container)]">
                        <img
                          src={product.image_url}
                          alt={
                            product.product_name ||
                            "Marketplace item"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />

                        {product.condition && (
                          <span className="absolute left-3 top-3 bg-[var(--background)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em]">
                            {product.condition}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="pt-3">
                      <Link
                        href={`/marketplace/${product.id}`}
                        className="block min-w-0"
                      >
                        <h2 className="truncate text-sm font-semibold">
                          {product.product_name ||
                            "Untitled item"}
                        </h2>

                        <p className="mt-1 text-sm font-bold">
                          {formatPrice(
                            product.price,
                            product.currency,
                          )}
                        </p>
                      </Link>

                      {seller && (
                        <Link
                          href={`/profile/${encodeURIComponent(
                            seller.username,
                          )}`}
                          className="mt-3 flex items-center gap-2"
                        >
                          {seller.avatar_url ? (
                            <img
                              src={seller.avatar_url}
                              alt={
                                seller.display_name ||
                                seller.username
                              }
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-container)] text-[10px] font-semibold">
                              {seller.username
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <span className="truncate text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                            @{seller.username}
                          </span>
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* Empty State */}
        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="border-y border-[var(--border)] py-24 text-center">
              <ShoppingBag
                size={30}
                strokeWidth={1.5}
                className="mx-auto text-[var(--muted)]"
              />

              <h2 className="mt-4 font-[family-name:var(--font-newsreader)] text-2xl font-semibold">
                {products.length === 0
                  ? "No items for sale yet"
                  : "Nothing found"}
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {products.length === 0
                  ? "Be the first to list something on Picly."
                  : "Try another search or category."}
              </p>

              {products.length === 0 ? (
                <Link
                  href="/create"
                  className="mt-5 inline-flex items-center gap-2 bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)]"
                >
                  <Plus
                    size={16}
                    strokeWidth={1.8}
                  />
                  Sell an item
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                  className="mt-5 text-sm font-semibold text-[var(--secondary)]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
      </section>

      {/* Mobile Bottom Navigation */}
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
            href="/explore"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <Search
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px]">
              Explore
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
