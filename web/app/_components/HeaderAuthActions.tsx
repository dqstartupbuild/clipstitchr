"use client";

import {
  useClerk,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";
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
    ? "inline-flex h-9 items-center rounded-lg px-2 text-xs font-semibold text-text-secondary"
    : "inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary";
  const primaryButtonClassName = isMobile
    ? "inline-flex h-9 items-center rounded-lg bg-accent px-3 text-xs font-semibold text-white"
    : "inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark";

  if (!isLoaded) {
    return (
      <div
        aria-hidden
        className={isMobile ? "h-9 w-28" : "h-10 w-40"}
      />
    );
  }

  const handleSignIn = () => {
    trackTikTokButtonClick({
      contentCategory: "Auth",
      contentId: "header_sign_in",
      contentName: "Header sign in",
    });
    void clerk.redirectToSignIn();
  };

  const handleSignUp = () => {
    trackTikTokButtonClick({
      contentCategory: "Auth",
      contentId: "header_sign_up",
      contentName: "Header sign up",
    });
    void clerk.redirectToSignUp();
  };

  const handleDashboardClick = () => {
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
            {!isMobile && <ArrowRight aria-hidden className="h-4 w-4" />}
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
          <button
            type="button"
            className={primaryButtonClassName}
            onClick={handleSignUp}
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );
}
