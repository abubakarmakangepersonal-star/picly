"use client";

import {
  ArrowLeft,
  Camera,
  Globe,
  Loader2,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, location, website",
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setProfile(data);
    setDisplayName(data.display_name ?? "");
    setUsername(data.username ?? "");
    setBio(data.bio ?? "");
    setLocation(data.location ?? "");
    setWebsite(data.website ?? "");
    setAvatarUrl(data.avatar_url ?? "");

    setLoading(false);
  }

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !profile) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5MB.");
      return;
    }

    setUploadingAvatar(true);

    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${profile.id}/avatar-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      setError("Could not create the profile photo URL.");
      setUploadingAvatar(false);
      return;
    }

    setAvatarUrl(data.publicUrl);
    setSuccess("Profile photo uploaded. Save your profile to keep it.");

    setUploadingAvatar(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setError("");
    setSuccess("");

    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanBio = bio.trim();
    const cleanLocation = location.trim();
    const cleanWebsite = website.trim();

    if (!cleanDisplayName) {
      setError("Display name is required.");
      return;
    }

    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-z0-9._]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain letters, numbers, periods, and underscores.",
      );
      return;
    }

    if (cleanBio.length > 160) {
      setError("Bio must be 160 characters or less.");
      return;
    }

    if (cleanWebsite) {
      const websiteValue = cleanWebsite.startsWith("http")
        ? cleanWebsite
        : `https://${cleanWebsite}`;

      try {
        new URL(websiteValue);
      } catch {
        setError("Please enter a valid website.");
        return;
      }
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name: cleanDisplayName,
        bio: cleanBio || null,
        location: cleanLocation || null,
        website: cleanWebsite || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      if (updateError.code === "23505") {
        setError("That username is already taken.");
      } else {
        setError(updateError.message);
      }

      setSaving(false);
      return;
    }

    setProfile({
      ...profile,
      username: cleanUsername,
      display_name: cleanDisplayName,
      bio: cleanBio || null,
      location: cleanLocation || null,
      website: cleanWebsite || null,
      avatar_url: avatarUrl || null,
    });

    setUsername(cleanUsername);
    setSuccess("Profile updated successfully.");

    setSaving(false);

    setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 700);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <Loader2 size={18} className="animate-spin" />
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <div className="text-center">
            <p className="mb-4 text-sm text-[var(--muted)]">
              {error || "Profile could not be loaded."}
            </p>

            <Link
              href="/profile"
              className="inline-flex items-center border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)]"
            >
              Back to profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
            <span>Profile</span>
          </Link>

          <Link
            href="/home"
            className="font-[var(--font-newsreader)] text-2xl font-semibold tracking-tight"
          >
            Picly
          </Link>

          <div className="w-[70px]" />
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Account
          </p>

          <h1 className="font-[var(--font-newsreader)] text-4xl font-medium tracking-tight sm:text-5xl">
            Edit profile
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Update the information people see when they visit your Picly
            profile.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile photo */}
          <div className="border-y border-[var(--border)] py-7">
            <div className="flex items-center gap-5">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-container)]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={34}
                    strokeWidth={1.4}
                    className="text-[var(--muted)]"
                  />
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2
                      size={22}
                      className="animate-spin text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">Profile photo</p>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  JPG, PNG or WebP. Maximum 5MB.
                </p>

                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-[var(--border)] px-4 py-2 text-xs font-semibold transition-colors hover:bg-[var(--surface-container)]">
                  <Camera size={15} strokeWidth={1.8} />
                  {uploadingAvatar ? "Uploading..." : "Change photo"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar || saving}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-7 py-8">
            {/* Display name */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-semibold"
              >
                Display name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                maxLength={80}
                className="w-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold"
              >
                Username
              </label>

              <div className="flex border border-[var(--border)] focus-within:border-[var(--foreground)]">
                <span className="flex items-center border-r border-[var(--border)] px-4 text-sm text-[var(--muted)]">
                  @
                </span>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value.toLowerCase())
                  }
                  placeholder="yourname"
                  maxLength={30}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--muted)]"
                />
              </div>

              <p className="mt-2 text-xs text-[var(--muted)]">
                Letters, numbers, periods and underscores only.
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="bio"
                  className="text-sm font-semibold"
                >
                  Bio
                </label>

                <span className="text-xs text-[var(--muted)]">
                  {bio.length}/160
                </span>
              </div>

              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell people a little about yourself..."
                maxLength={160}
                rows={4}
                className="w-full resize-none border border-[var(--border)] bg-transparent px-4 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 flex items-center gap-2 text-sm font-semibold"
              >
                <MapPin size={16} strokeWidth={1.7} />
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Dar es Salaam"
                maxLength={100}
                className="w-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="mb-2 flex items-center gap-2 text-sm font-semibold"
              >
                <Globe size={16} strokeWidth={1.7} />
                Website
              </label>

              <input
                id="website"
                type="text"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="yourwebsite.com"
                maxLength={200}
                className="w-full border border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-5 border border-[var(--error)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 border border-[var(--border)] bg-[var(--surface-container-low)] px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/profile"
              className="flex items-center justify-center border border-[var(--border)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-container)]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="flex items-center justify-center gap-2 bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} strokeWidth={1.8} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Picly</p>

          <div className="flex gap-5">
            <Link
              href="/help"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Help
            </Link>

            <Link
              href="/settings"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}