"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getPostHogPageCategory } from "@/lib/clipstitchr/analytics/getPostHogPageCategory";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";

export function PostHogPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPostHogEvent("$pageview", {
      page_category: getPostHogPageCategory(pathname),
      page_path: pathname,
      page_search: window.location.search,
      page_title: document.title,
      page_url: window.location.href,
    });
  }, [pathname]);

  return null;
}
