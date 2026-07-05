import Link from "next/link";
import type { ReactNode } from "react";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

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
      prefetch={false}
      className={[
        PRIMARY_BUTTON_CLASS_NAME,
        className,
      ].join(" ")}
    >
      {children}
      {icon}
    </Link>
  );
}
