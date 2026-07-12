import type { HookLabView } from "@/lib/clipstitchr/types/HookLabView";

export function getHookLabViewFromSearchParams(
  searchParams: URLSearchParams,
): HookLabView {
  return searchParams.get("view") === "review" ? "review" : "ideas";
}
