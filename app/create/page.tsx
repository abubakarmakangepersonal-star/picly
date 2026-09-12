"use client";

import {
  ArrowLeft,
  Bell,
  ImagePlus,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const categories = [
  "Fashion",
  "Electronics",
  "Art",
  "Furniture",
  "Accessories",
  "Other",
];

const conditions = ["New", "Like New", "Good", "Fair"];

const currencies = [
  { code: "TZS", label: "TSh — Tanzanian Shilling" },
  { code: "USD", label: "$ — US Dollar" },
  { code: "KES", label: "KSh — Kenyan Shilling" },
  { code: "UGX", label: "USh — Ugandan Shilling" },
  { code: "EUR", label: "€ — Euro" },
  { code: "GBP", label: "£ — British Pound" },
];

const currencySymbols: Record<string, string> = {
  TZS: "TSh",
  USD: "$",
  KES: "KSh",
  UGX: "USh",
  EUR: "€",
  GBP: "£",
};

export default function CreatePage() {
  const router = useRouter();

  const [isForSale, setIsForSale] = useState(false);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  // TSh / TZS is the default currency.
  const [currency, setCurrency] = useState("TZS");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }

    setError("");
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setPublished(false);

    if (!image) {
      setError("Please choose a photo first.");
      return;
    }

    if (isForSale) {
      if (!productName.trim()) {
        setError("Please enter an item name.");
        return;
      }

      if (!price || Number(price) <= 0) {
        setError("Please enter a valid price.");
        return;
      }

      if (!currency) {
        setError("Please select a currency.");
        return;
      }

      if (!category) {
        setError("Please select a category.");
        return;
      }

      if (!condition) {
        setError("Please select the item's condition.");
        return;
      }
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "You must be logged in to create a post.",
        );
        setLoading(false);
        return;
      }

      const fileExtension =
        image.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("post-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
          });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      const { error: postError } =
        await supabase.from("posts").insert({
          user_id: user.id,
          image_url: publicUrl,
          caption: caption.trim() || null,
          location: location.trim() || null,

          // Marketplace fields
          is_for_sale: isForSale,
          product_name: isForSale
            ? productName.trim()
            : null,
          price: isForSale
            ? Number(price)
            : null,
          currency: isForSale
            ? currency
            : "TZS",
          category: isForSale
            ? category
            : null,
          condition: isForSale
            ? condition
            : null,
          listing_location: isForSale
            ? location.trim() || null
            : null,
        });

      if (postError) {
        await supabase.storage
          .from("post-images")
          .remove([filePath]);

        setError(postError.message);
        setLoading(false);
        return;
      }

      setPublished(true);

      setTimeout(() => {
        router.push("/home");
        router.refresh();
      }, 800);
    } catch {
      setError(
        "Something went wrong while publishing your post.",
      );
      setLoading(false);
    }
  }

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
          className="flex items-center gap-2"
          aria-label="Back to home"
        >
          <ArrowLeft
            size={19}
            strokeWidth={1.8}
          />

          <span className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight">
            Picly
          </span>
        </Link>

        <span className="text-sm font-semibold">
          Create
        </span>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16">
        <div className="py-8 sm:py-10">
          {/* Heading */}
          <div className="border-b border-[var(--border)] pb-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--secondary)]">
              New post
            </p>

            <h1 className="font-[var(--font-newsreader)] text-4xl tracking-tight sm:text-5xl">
              Share what you see.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Share a moment, an object, or something
              you think others should see.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-10 py-8 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
              {/* Image upload */}
              <section>
                <label
                  htmlFor="image-upload"
                  className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-[var(--border)] bg-[var(--surface-container-low)] px-6 text-center transition-colors hover:border-[var(--foreground)]"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Selected post preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />

                      <span className="relative z-10 border border-white bg-white px-4 py-2 text-xs font-semibold text-black opacity-0 transition-opacity group-hover:opacity-100">
                        Change image
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center border border-[var(--border)] bg-[var(--background)]">
                        <ImagePlus
                          size={24}
                          strokeWidth={1.5}
                        />
                      </div>

                      <p className="mt-5 text-sm font-semibold">
                        Add a photo
                      </p>

                      <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--muted)]">
                        Drag and drop an image here, or
                        choose one from your device.
                      </p>

                      <span className="mt-5 border border-[var(--border)] px-4 py-2 text-xs font-semibold transition-colors group-hover:border-[var(--foreground)]">
                        Choose image
                      </span>
                    </>
                  )}

                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </section>

              {/* Form */}
              <section>
                <div className="space-y-7">
                  {/* Caption */}
                  <div>
                    <label
                      htmlFor="caption"
                      className="mb-2 block text-xs font-semibold"
                    >
                      Caption
                    </label>

                    <textarea
                      id="caption"
                      name="caption"
                      rows={5}
                      value={caption}
                      onChange={(event) =>
                        setCaption(event.target.value)
                      }
                      placeholder="Tell people what they're looking at..."
                      disabled={loading}
                      className="w-full resize-none border border-[var(--border)] bg-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-xs font-semibold"
                    >
                      Location
                    </label>

                    <div className="flex items-center border border-[var(--border)]">
                      <MapPin
                        size={17}
                        strokeWidth={1.7}
                        className="ml-3 shrink-0 text-[var(--muted)]"
                      />

                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={location}
                        onChange={(event) =>
                          setLocation(event.target.value)
                        }
                        placeholder="Add a location"
                        disabled={loading}
                        className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-[var(--muted)] disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Marketplace toggle */}
                  <div className="border-y border-[var(--border)] py-5">
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag
                            size={17}
                            strokeWidth={1.7}
                          />

                          <p className="text-sm font-semibold">
                            List this for sale
                          </p>
                        </div>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--muted)]">
                          Turn this photo into a marketplace
                          listing.
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isForSale}
                        aria-label="List this item for sale"
                        onClick={() =>
                          setIsForSale(
                            (value) => !value,
                          )
                        }
                        disabled={loading}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          isForSale
                            ? "bg-[var(--foreground)]"
                            : "bg-[var(--surface-container-highest)]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--background)] transition-transform ${
                            isForSale
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Marketplace fields */}
                  {isForSale && (
                    <div className="space-y-5 border-b border-[var(--border)] pb-7">
                      {/* Item name */}
                      <div>
                        <label
                          htmlFor="product-name"
                          className="mb-2 block text-xs font-semibold"
                        >
                          Item name
                        </label>

                        <input
                          id="product-name"
                          name="productName"
                          type="text"
                          value={productName}
                          onChange={(event) =>
                            setProductName(
                              event.target.value,
                            )
                          }
                          placeholder="e.g. Handwoven Studio Chair"
                          disabled={loading}
                          className="h-11 w-full border border-[var(--border)] bg-transparent px-4 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--foreground)] disabled:opacity-60"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label
                          htmlFor="price"
                          className="mb-2 block text-xs font-semibold"
                        >
                          Price
                        </label>

                        <div className="flex items-center border border-[var(--border)]">
                          <span className="min-w-[58px] pl-4 text-sm font-medium text-[var(--foreground)]">
                            {currencySymbols[
                              currency
                            ] || "TSh"}
                          </span>

                          <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step={
                              currency === "TZS" ||
                              currency === "UGX" ||
                              currency === "KES"
                                ? "1"
                                : "0.01"
                            }
                            value={price}
                            onChange={(event) =>
                              setPrice(
                                event.target.value,
                              )
                            }
                            placeholder={
                              currency === "TZS"
                                ? "150000"
                                : "0.00"
                            }
                            disabled={loading}
                            className="h-11 w-full bg-transparent px-2 text-sm outline-none placeholder:text-[var(--muted)] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* Currency */}
                      <div>
                        <label
                          htmlFor="currency"
                          className="mb-2 block text-xs font-semibold"
                        >
                          Currency
                        </label>

                        <select
                          id="currency"
                          value={currency}
                          onChange={(event) =>
                            setCurrency(
                              event.target.value,
                            )
                          }
                          disabled={loading}
                          className="h-11 w-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none focus:border-[var(--foreground)] disabled:opacity-60"
                        >
                          {currencies.map((item) => (
                            <option
                              key={item.code}
                              value={item.code}
                            >
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div>
                        <label
                          htmlFor="category"
                          className="mb-2 block text-xs font-semibold"
                        >
                          Category
                        </label>

                        <select
                          id="category"
                          value={category}
                          onChange={(event) =>
                            setCategory(
                              event.target.value,
                            )
                          }
                          disabled={loading}
                          className="h-11 w-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none focus:border-[var(--foreground)] disabled:opacity-60"
                        >
                          <option value="">
                            Select category
                          </option>

                          {categories.map((item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Condition */}
                      <div>
                        <label
                          htmlFor="condition"
                          className="mb-2 block text-xs font-semibold"
                        >
                          Condition
                        </label>

                        <select
                          id="condition"
                          value={condition}
                          onChange={(event) =>
                            setCondition(
                              event.target.value,
                            )
                          }
                          disabled={loading}
                          className="h-11 w-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none focus:border-[var(--foreground)] disabled:opacity-60"
                        >
                          <option value="">
                            Select condition
                          </option>

                          {conditions.map((item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="border border-[var(--error)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--error)]"
                    >
                      {error}
                    </div>
                  )}

                  {/* Publish */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full bg-[var(--foreground)] px-6 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Publishing..."
                        : "Publish post"}
                    </button>

                    {published && (
                      <p className="mt-3 text-center text-xs font-medium text-[var(--secondary)]">
                        Post published successfully.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)] lg:hidden">
        <div className="grid h-16 grid-cols-5">
          <Link
            href="/home"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <span className="text-lg">⌂</span>
            <span className="text-[10px] font-medium">
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
            <span className="text-[10px] font-medium">
              Explore
            </span>
          </Link>

          <Link
            href="/create"
            className="flex flex-col items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <Plus
              size={21}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-semibold">
              Create
            </span>
          </Link>

          <Link
            href="/marketplace"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Market
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-1 text-[var(--muted)]"
          >
            <User
              size={19}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}