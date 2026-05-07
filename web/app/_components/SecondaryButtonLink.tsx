import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type SecondaryButtonLinkProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function SecondaryButtonLink({
  href,
  children,
  icon,
  className = "",
  onClick,
}: SecondaryButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      ].join(" ")}
    >
      {children}
      {icon}
    </Link>
  );
}
