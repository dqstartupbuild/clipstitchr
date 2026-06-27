import type { SchedulePageTab } from "@/lib/clipstitchr/types/SchedulePageTab";

export function getSchedulePageTabFromSearchParams(
  searchParams: URLSearchParams,
): SchedulePageTab {
  return searchParams.get("tab") === "accounts" ? "accounts" : "posts";
}
