"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";

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
    trackPostHogEvent("cta_clicked", {
      cta_id: contentId,
      cta_label: contentName,
      destination: href,
      location: contentCategory,
    });
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
