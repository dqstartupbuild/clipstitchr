"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { identifyTikTokUser } from "@/lib/clipstitchr/analytics/identifyTikTokUser";

export function TikTokIdentityReporter() {
  const { isLoaded, isSignedIn, user } = useUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const externalId = user?.id ?? null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const identifyTimer = window.setTimeout(() => {
      void identifyTikTokUser({
        email: primaryEmail,
        externalId,
      });
    }, 500);

    return () => {
      window.clearTimeout(identifyTimer);
    };
  }, [externalId, isLoaded, isSignedIn, primaryEmail]);

  return null;
}
