"use client";

import { useEffect, useState } from "react";
import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { applyCookieConsentPreferences } from "@/lib/clipstitchr/analytics/applyCookieConsentPreferences";
import { createCookieConsentPreferences } from "@/lib/clipstitchr/analytics/createCookieConsentPreferences";
import { getStoredCookieConsent } from "@/lib/clipstitchr/analytics/getStoredCookieConsent";
import { openCookiePreferencesEventName } from "@/lib/clipstitchr/analytics/openCookiePreferencesEventName";
import { setStoredCookieConsent } from "@/lib/clipstitchr/analytics/setStoredCookieConsent";
import { CookieConsentBanner } from "@/app/_components/analytics/CookieConsentBanner";
import { CookiePreferencesDialog } from "@/app/_components/analytics/CookiePreferencesDialog";
import { PostHogPageViewTracker } from "@/app/_components/analytics/PostHogPageViewTracker";
import { TikTokPixelScript } from "@/app/_components/analytics/TikTokPixelScript";
import { TikTokViewContentTracker } from "@/app/_components/analytics/TikTokViewContentTracker";

type ConsentPanel = "banner" | "preferences";

export function CookieConsentManager() {
  const [preferences, setPreferences] =
    useState<CookieConsentPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<ConsentPanel | null>(null);

  useEffect(() => {
    const syncStoredPreferences = () => {
      const storedPreferences = getStoredCookieConsent();

      if (storedPreferences) {
        applyCookieConsentPreferences(storedPreferences);
        setPreferences(storedPreferences);
      } else {
        applyCookieConsentPreferences(
          createCookieConsentPreferences({
            analytics: false,
            marketing: false,
          }),
        );
        setActivePanel("banner");
      }

      setIsLoaded(true);
    };

    const handleOpenPreferences = () => setActivePanel("preferences");
    const syncTimer = window.setTimeout(syncStoredPreferences, 0);

    window.addEventListener(
      openCookiePreferencesEventName,
      handleOpenPreferences,
    );

    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener(
        openCookiePreferencesEventName,
        handleOpenPreferences,
      );
    };
  }, []);

  const savePreferences = (nextPreferences: CookieConsentPreferences) => {
    setStoredCookieConsent(nextPreferences);
    applyCookieConsentPreferences(nextPreferences);
    setPreferences(nextPreferences);
    setActivePanel(null);
  };

  const handleAcceptAll = () => {
    savePreferences(
      createCookieConsentPreferences({
        analytics: true,
        marketing: true,
      }),
    );
  };

  const handleRejectOptional = () => {
    savePreferences(
      createCookieConsentPreferences({
        analytics: false,
        marketing: false,
      }),
    );
  };

  const handleSave = ({
    analytics,
    marketing,
  }: {
    analytics: boolean;
    marketing: boolean;
  }) => {
    savePreferences(
      createCookieConsentPreferences({
        analytics,
        marketing,
      }),
    );
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {preferences?.analytics && <PostHogPageViewTracker />}
      {preferences?.marketing && <TikTokPixelScript />}
      {preferences?.marketing && <TikTokViewContentTracker />}
      {activePanel === "banner" && (
        <CookieConsentBanner
          onAcceptAll={handleAcceptAll}
          onEssentialsOnly={handleRejectOptional}
        />
      )}
      {activePanel === "preferences" && (
        <CookiePreferencesDialog
          initialAnalytics={preferences?.analytics ?? true}
          initialMarketing={preferences?.marketing ?? true}
          onAcceptAll={handleAcceptAll}
          onCancel={() => setActivePanel(null)}
          onEssentialsOnly={handleRejectOptional}
          onSave={handleSave}
        />
      )}
    </>
  );
}
