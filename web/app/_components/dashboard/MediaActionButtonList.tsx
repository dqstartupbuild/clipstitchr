"use client";

import Link from "next/link";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";

type MediaActionButtonListProps = {
  className?: string;
  items: MediaCardActionMenuItem[];
};

const baseClasses =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

function getItemClasses(item: MediaCardActionMenuItem) {
  return [
    baseClasses,
    item.variant === "danger"
      ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
      : "border-border bg-surface text-text-primary hover:border-accent",
  ].join(" ");
}

export function MediaActionButtonList({
  className = "",
  items,
}: MediaActionButtonListProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}>
      {items.map((item) =>
        item.href && !item.disabled ? (
          <Link
            key={item.label}
            href={item.href}
            className={getItemClasses(item)}
          >
            {item.icon}
            {item.label}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            className={getItemClasses(item)}
            onClick={() => {
              if (item.disabled) {
                return;
              }

              item.onClick?.();
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
