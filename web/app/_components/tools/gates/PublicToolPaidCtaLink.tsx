"use client";

import type { ReactNode } from "react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { trackPublicToolAnalyticsEvent } from "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent";

type PublicToolPaidCtaLinkProps = {
  children: ReactNode;
  className: string;
  contentCategory: string;
  contentId: string;
  contentName: string;
  toolKey: PublicToolKey;
  variant: PublicToolGateVariant;
};

export function PublicToolPaidCtaLink({
  children,
  className,
  contentCategory,
  contentId,
  contentName,
  toolKey,
  variant,
}: PublicToolPaidCtaLinkProps) {
  return (
    <TrackedButtonLink
      className={className}
      contentCategory={contentCategory}
      contentId={contentId}
      contentName={contentName}
      href="/pricing"
      onClick={() =>
        trackPublicToolAnalyticsEvent("tool_paid_cta_clicked", {
          gateMode: getPublicToolGateMetadata(toolKey).mode,
          toolKey,
          variant,
        })
      }
    >
      {children}
    </TrackedButtonLink>
  );
}
