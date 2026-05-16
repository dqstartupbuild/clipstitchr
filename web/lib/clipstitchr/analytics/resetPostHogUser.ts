import posthog from "posthog-js";
import { getIsPostHogConfigured } from "@/lib/clipstitchr/analytics/getIsPostHogConfigured";

export function resetPostHogUser() {
  if (typeof window === "undefined" || !getIsPostHogConfigured()) {
    return;
  }

  posthog.reset();
}
