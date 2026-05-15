"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";

type TrackedButtonLinkProps = {
  children: ReactNode;
  className: string;
  contentCategory: string;
  contentId: string;
  contentName: string;
  href: string;
};

export function TrackedButtonLink({
  children,
  className,
  contentCategory,
  contentId,
  contentName,
  href,
}: TrackedButtonLinkProps) {
  const handleClick = () => {
    trackTikTokButtonClick({
      contentCategory,
      contentId,
      contentName,
    });
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
