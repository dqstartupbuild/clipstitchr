"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type MediaPrimaryActionProps = {
  disabled?: boolean;
  href?: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
};

export function MediaPrimaryAction({
  disabled = false,
  href,
  icon,
  label,
  onClick,
}: MediaPrimaryActionProps) {
  const className = [
    "inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    disabled ? "pointer-events-none opacity-60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
    return (
      <Link className={className} href={href}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
