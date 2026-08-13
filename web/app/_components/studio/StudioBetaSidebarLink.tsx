"use client";

import Link from "next/link";
import { StudioCutMark } from "@/app/_components/studio/StudioCutMark";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { useStudioBetaAccess } from "@/lib/clipstitchr/hooks/useStudioBetaAccess";

type StudioBetaSidebarLinkProps = {
  onNavigate: () => void;
  pathname: string;
};

export function StudioBetaSidebarLink({
  onNavigate,
  pathname,
}: StudioBetaSidebarLinkProps) {
  const { hasAccess } = useStudioBetaAccess();

  if (!hasAccess) {
    return null;
  }

  const isActive = pathname.startsWith("/dashboard/studio");

  return (
    <Link
      href="/dashboard/studio"
      aria-current={isActive ? "page" : undefined}
      className={[
        "dashboard-sidebar-link mb-2 inline-flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors",
        isActive
          ? "dashboard-sidebar-link-active border-border-hover bg-surface-muted text-accent-dark"
          : "border-border/70 bg-background/70 text-text-primary hover:border-border-hover hover:bg-surface-muted",
      ].join(" ")}
      onClick={() => {
        trackPostHogEvent("dashboard_navigation_clicked", {
          destination: "/dashboard/studio",
          label: "Studio Beta",
        });
        onNavigate();
      }}
    >
      <StudioCutMark className="h-4 w-4" />
      Studio Beta
    </Link>
  );
}
