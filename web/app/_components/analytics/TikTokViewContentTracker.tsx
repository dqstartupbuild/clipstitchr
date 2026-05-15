"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackTikTokPageView } from "@/lib/clipstitchr/analytics/trackTikTokPageView";
import { trackTikTokViewContent } from "@/lib/clipstitchr/analytics/trackTikTokViewContent";

export function TikTokViewContentTracker() {
  const pathname = usePathname();
  const hasTrackedInitialPath = useRef(false);

  useEffect(() => {
    const trackingTimer = window.setTimeout(() => {
      if (hasTrackedInitialPath.current) {
        trackTikTokPageView();
      }

      trackTikTokViewContent(pathname);
      hasTrackedInitialPath.current = true;
    }, 1000);

    return () => {
      window.clearTimeout(trackingTimer);
    };
  }, [pathname]);

  return null;
}
