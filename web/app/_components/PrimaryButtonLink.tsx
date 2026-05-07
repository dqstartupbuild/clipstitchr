import Link from "next/link";
import type { ReactNode } from "react";

type PrimaryButtonLinkProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function PrimaryButtonLink({
  href,
  children,
  icon,
  className = "",
}: PrimaryButtonLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      ].join(" ")}
    >
      {children}
      {icon}
    </Link>
  );
}
