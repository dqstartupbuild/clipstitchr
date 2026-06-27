import type { SchedulePageTab } from "@/lib/clipstitchr/types/SchedulePageTab";
import { getSchedulePageTabFromSearchParams } from "@/lib/clipstitchr/utils/getSchedulePageTabFromSearchParams";

export function getInitialSchedulePageTab(): SchedulePageTab {
  if (typeof window === "undefined") {
    return "posts";
  }

  return getSchedulePageTabFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}
