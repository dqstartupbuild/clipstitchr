"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackTikTokPageView } from "@/lib/clipstitchr/analytics/trackTikTokPageView";
import { trackTikTokViewContent } from "@/lib/clipstitchr/analytics/trackTikTokViewContent";

export function TikTokViewContentTracker() {
  const pathname = usePathname();
  const hasSkippedInitialPath = useRef(false);

  useEffect(() => {
    if (!hasSkippedInitialPath.current) {
      hasSkippedInitialPath.current = true;
      return;
    }

    const trackingTimer = window.setTimeout(() => {
      trackTikTokPageView();
      trackTikTokViewContent(pathname);
    }, 0);

    return () => {
      window.clearTimeout(trackingTimer);
    };
  }, [pathname]);

  return null;
}
