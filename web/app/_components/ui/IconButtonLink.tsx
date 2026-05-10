import Link from "next/link";
import type { ReactNode } from "react";

type IconButtonLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  className?: string;
  variant?: "default" | "danger";
};

export function IconButtonLink({
  href,
  label,
  icon,
  className = "",
  variant = "default",
}: IconButtonLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variant === "danger"
          ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
          : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
    </Link>
  );
}
