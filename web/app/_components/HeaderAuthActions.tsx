"use client";

import { useClerk, useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { site } from "@/lib/site";

type HeaderAuthActionsProps = {
  variant?: "desktop" | "mobile";
};

export function HeaderAuthActions({
  variant = "desktop",
}: HeaderAuthActionsProps) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  const isMobile = variant === "mobile";
  const secondaryButtonClassName = isMobile
    ? "header-auth-secondary inline-flex h-9 items-center px-2 text-xs font-semibold text-text-secondary"
    : "header-auth-secondary inline-flex h-10 items-center px-3 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary";
  const primaryButtonClassName = isMobile
    ? "header-auth-primary inline-flex h-9 items-center bg-accent px-3 text-xs font-semibold text-text-inverse"
    : "header-auth-primary inline-flex h-10 items-center gap-2 bg-accent px-4 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-light";

  if (!isLoaded) {
    return <div aria-hidden className={isMobile ? "h-9 w-28" : "h-10 w-40"} />;
  }

  const handleSignIn = () => {
    trackPostHogEvent("auth_cta_clicked", {
      action: "sign_in",
      location: "header",
      variant,
    });
    trackTikTokButtonClick({
      contentCategory: "Auth",
      contentId: "header_sign_in",
      contentName: "Header sign in",
    });
    void clerk.redirectToSignIn();
  };

  const handlePricingClick = () => {
    trackPostHogEvent("pricing_cta_clicked", {
      location: "header",
      variant,
    });
    trackTikTokButtonClick({
      contentCategory: "Pricing",
      contentId: "header_pricing",
      contentName: "Header see pricing",
    });
  };

  const handleDashboardClick = () => {
    trackPostHogEvent("dashboard_cta_clicked", {
      location: "header",
      variant,
    });
    trackTikTokButtonClick({
      contentCategory: "App",
      contentId: "header_dashboard",
      contentName: "Header dashboard",
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {isSignedIn ? (
        <>
          <Link
            href={site.ctaUrl}
            className={primaryButtonClassName}
            onClick={handleDashboardClick}
          >
            {isMobile ? "Dashboard" : site.ctaLabel}
          </Link>
          <UserButton />
        </>
      ) : (
        <>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={handleSignIn}
          >
            Sign in
          </button>
          <Link
            href="/pricing"
            className={primaryButtonClassName}
            onClick={handlePricingClick}
          >
            {isMobile ? "Pricing" : "See pricing"}
          </Link>
        </>
      )}
    </div>
  );
}
