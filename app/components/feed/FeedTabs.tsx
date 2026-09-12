"use client";

import { ChevronDown } from "lucide-react";

type FeedTab = "forYou" | "following";

type FeedTabsProps = {
  activeTab: FeedTab;
  onChange: (tab: FeedTab) => void;
};

export default function FeedTabs({
  activeTab,
  onChange,
}: FeedTabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-[var(--border)] py-4">
      <button
        type="button"
        onClick={() => onChange("forYou")}
        className={
          "text-sm font-semibold " +
          (activeTab === "forYou"
            ? "text-[var(--foreground)]"
            : "text-[var(--muted)]")
        }
      >
        For you
      </button>

      <button
        type="button"
        onClick={() => onChange("following")}
        className={
          "text-sm font-semibold " +
          (activeTab === "following"
            ? "text-[var(--foreground)]"
            : "text-[var(--muted)]")
        }
      >
        Following
      </button>

      <ChevronDown
        size={16}
        strokeWidth={1.7}
        className="ml-auto text-[var(--muted)]"
      />
    </div>
  );
}