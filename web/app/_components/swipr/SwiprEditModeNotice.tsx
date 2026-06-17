"use client";

import { Edit3, Plus } from "lucide-react";
import Link from "next/link";

type SwiprEditModeNoticeProps = {
  isLoading: boolean;
  isMissing: boolean;
  swipeName?: string;
  onCreateNew: () => void;
};

export function SwiprEditModeNotice({
  isLoading,
  isMissing,
  onCreateNew,
  swipeName,
}: SwiprEditModeNoticeProps) {
  const statusText = isMissing
    ? "We could not find this Swipe."
    : isLoading
      ? "Loading this Swipe..."
      : swipeName
        ? `Editing ${swipeName}`
        : "Editing saved Swipe";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/20 bg-surface-muted px-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent-dark">
          <Edit3 aria-hidden className="h-4 w-4" />
          Edit mode
        </p>
        <p className="mt-1 text-sm font-semibold text-text-primary">
          {statusText}
        </p>
      </div>
      <Link
        href="/dashboard/swipr"
        onClick={onCreateNew}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent"
      >
        <Plus aria-hidden className="h-4 w-4" />
        New Swipe
      </Link>
    </div>
  );
}
