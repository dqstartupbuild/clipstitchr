"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { identifyPostHogUser } from "@/lib/clipstitchr/analytics/identifyPostHogUser";
import { resetPostHogUser } from "@/lib/clipstitchr/analytics/resetPostHogUser";

export function PostHogIdentityReporter() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      resetPostHogUser();
      return;
    }

    identifyPostHogUser(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? undefined,
    });
  }, [isLoaded, isSignedIn, user]);

  return null;
}
