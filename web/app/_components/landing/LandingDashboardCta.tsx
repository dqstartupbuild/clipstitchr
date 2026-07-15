"use client";

import { useEffect, type ReactNode } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";

type LandingDashboardCtaProps = {
  className: string;
  contentId: string;
  contentName: string;
  signedOutAction?: "sign-in" | "sign-up";
  signedOutLabel: ReactNode;
};

export function LandingDashboardCta({
  className,
  contentId,
  contentName,
  signedOutAction = "sign-up",
  signedOutLabel,
}: LandingDashboardCtaProps) {
  const clerk = useClerk();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const signedOutDestination =
    signedOutAction === "sign-in" ? "/sign-in" : "/sign-up";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.prefetch("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const trackClick = () => {
    trackPostHogEvent("cta_clicked", {
      cta_id: contentId,
      cta_label: contentName,
      destination: isSignedIn ? "/dashboard" : signedOutDestination,
      location: "Landing page",
    });
    trackTikTokButtonClick({
      contentCategory: "Landing page",
      contentId,
      contentName,
    });
  };

  const handleSignedOutClick = () => {
    if (!isLoaded) {
      return;
    }

    trackClick();

    if (signedOutAction === "sign-in") {
      void clerk.redirectToSignIn();
      return;
    }

    void clerk.redirectToSignUp();
  };

  if (isLoaded && isSignedIn) {
    return (
      <Link href="/dashboard" className={className} onClick={trackClick}>
        Dashboard
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={!isLoaded}
      onClick={handleSignedOutClick}
    >
      {signedOutLabel}
    </button>
  );
}
