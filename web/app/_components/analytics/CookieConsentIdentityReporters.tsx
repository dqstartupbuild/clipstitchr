"use client";

import { useEffect, useState } from "react";
import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { cookieConsentUpdatedEventName } from "@/lib/clipstitchr/analytics/cookieConsentUpdatedEventName";
import { getStoredCookieConsent } from "@/lib/clipstitchr/analytics/getStoredCookieConsent";
import { PostHogIdentityReporter } from "@/app/_components/analytics/PostHogIdentityReporter";
import { TikTokIdentityReporter } from "@/app/_components/analytics/TikTokIdentityReporter";

export function CookieConsentIdentityReporters() {
  const [preferences, setPreferences] =
    useState<CookieConsentPreferences | null>(null);

  useEffect(() => {
    const syncPreferences = () => {
      setPreferences(getStoredCookieConsent());
    };

    syncPreferences();
    window.addEventListener(cookieConsentUpdatedEventName, syncPreferences);

    return () => {
      window.removeEventListener(
        cookieConsentUpdatedEventName,
        syncPreferences,
      );
    };
  }, []);

  return (
    <>
      {preferences?.analytics && <PostHogIdentityReporter />}
      {preferences?.marketing && <TikTokIdentityReporter />}
    </>
  );
}
